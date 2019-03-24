# -*- coding: utf-8 -*-
from RegisterProfilerReader import RegisterProfileReader
import json
import numpy as np
import pandas as pd
from htmltable import html
import os

top_module = 'SOC'
project = 'RL6608'


filelist = ['chip_soc_index.xls']
module = False
df = None

for xls in filelist:
    if '.xls' not in xls:
        print('this {} type of file not support\n Current Only support xls :P')
        continue
    xls = os.path.join(project, xls)
    print('parsing {}'.format(xls))
    reader = RegisterProfileReader(xls_file=xls)
    reader.read_index(module=module, addr_offset='0x18145000')
    reader.get_blocks()
    if df is None:
        df = reader.registers()
    else:
        df = pd.concat([df, reader.registers()])
    del reader

col_to_keep = [0, 2, 4, 7, 8, 9, 11, 12, 13]
col_to_rename = ['ADDR', 'NAME', 'BLOCK', 'MSB', 'LSB', 'Field',
                 'Description', 'Access', 'Default']

df = df.iloc[:, col_to_keep]
df = df.replace('', np.nan)

df.columns = col_to_rename
check = df['ADDR'].dropna()
# print(check.is_unique)
if not check.is_unique:
    print('# WARNING: Address space is not unique; Some address is duplicated')
df[['ADDR', 'NAME', 'BLOCK']] = df[['ADDR', 'NAME', 'BLOCK']].fillna(method='ffill')
df = df.replace(np.nan, '')
df.MSB = df['MSB'].apply(int)
df.LSB = df['LSB'].apply(int)


groupDict = df.groupby(['BLOCK', 'ADDR', 'NAME']).apply(
    lambda g: g.drop(['BLOCK', 'ADDR', 'NAME'], axis=1).to_dict(orient='records')
    ).to_dict()


myjson = {'project': [project],
          'top_module': [top_module],
          }

for key, items in groupDict.items():
    block, addr, name = key
    myjson.setdefault(block, [])
    myjson[block].append(dict(address=addr, name=name,
                              fields=items,
                              ),
                         )

# with open('database.js', 'w') as f:
#     f.write('var tableData = ')
#     f.write(json.dumps(myjson))
#     f.write(';')
#     # print(json.dumps(myjson, indent=2))
html.gen_js_script(myjson, './template.html', '{0}_{1}.html'.format(top_module, project))
