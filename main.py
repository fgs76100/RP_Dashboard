# -*- coding: utf-8 -*-
from RegisterProfilerReader import RegisterProfileReader
import json
import numpy as np
import pandas as pd
from htmltable import html

# filelist = ['./DRAMS.xls', './MEM_SRAM_RegisterProfile_RL6537.xls']
# addrlist = ['0x18005000', '0x18004000']
filelist = ['chip_soc_index.xls']
addrlist = ['0x18005000']
df = None
for xls, addr in zip(filelist, addrlist):
    reader = RegisterProfileReader(xls_file=xls)
    reader.read_index(module=False, offset=addr)
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
df[['ADDR', 'NAME', 'BLOCK']] = df[['ADDR', 'NAME', 'BLOCK']].fillna(method='ffill')
df = df.replace(np.nan, '')
df.MSB = df['MSB'].apply(int)
df.LSB = df['LSB'].apply(int)
table = html()
# print(df['ADDR'].is_unique)
table.create_table(head=df.columns.values, table=df.values)
# print(table.get_table())
# print(df.to_string())


