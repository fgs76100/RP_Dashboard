# -*- coding: utf-8 -*-
from RegisterProfilerReader import RegisterProfileReader
import json
import numpy as np
import pandas as pd
from htmltable import html

filelist = ['./DRAMS.xls']
addrlist = ['0x18145000']
# filelist = ['chip_soc_index.xls']
# addrlist = ['0x18005000']
df = None
for xls, addr in zip(filelist, addrlist):
    reader = RegisterProfileReader(xls_file=xls)
    reader.read_index(module=True, offset=addr)
    reader.get_blocks()
    if df is None:
        df = reader.registers()
    else:
        df = pd.concat([df, reader.registers()])
    del reader

col_to_keep = [0, 2, 4, 7, 8, 9, 11, 12, 13]
col_to_rename = ['ADDR', 'NAME', 'BLOCK', 'MSB', 'LSB', 'Field',
                 'Description', 'R/W', 'Default']
# for index, value in enumerate(df.columns):
#     print(index, value)
df = df.iloc[:, col_to_keep]
df = df.replace('', np.nan)
# print(df.to_string())
df.columns = col_to_rename
check = df['ADDR'].dropna()
print(check.is_unique)
print()
df[['ADDR', 'NAME', 'BLOCK']] = df[['ADDR', 'NAME', 'BLOCK']].fillna(method='ffill')
df = df.replace(np.nan, '')
df.MSB = df['MSB'].apply(int)
df.LSB = df['LSB'].apply(int)
# table = html()
# #
# table.create_table(head=df.columns.values, table=df.values)
# print(table.get_table())
# df.set_index(['BLOCK', 'ADDR', 'NAME'], inplace=True)
# block = pd.unique(df['BLOCK'])
# addrs = pd.unique(df['ADDR'])
# names = pd.unique(df['NAME'])
# for addr, name in zip(addrs, names):
#     selected = df.loc[(df['ADDR']==addr) & (df['NAME']==name)]
#     print(selected)
# df.to_json('database.json',
#            orient='split',
#            index=False
#            )
groupDict = df.groupby(['BLOCK', 'ADDR', 'NAME']).apply(
    lambda g: g.drop(['BLOCK', 'ADDR', 'NAME'], axis=1).to_dict(orient='records')
    ).to_dict()


myjson = {}

for key, items in groupDict.items():
    block, addr, name = key
    myjson.setdefault(block, [])
    myjson[block].append(dict(address=addr, name=name,
                              fields=items
                              )
                         )

with open('database.json', 'w') as f:
    f.write(json.dumps(myjson, indent=2))

