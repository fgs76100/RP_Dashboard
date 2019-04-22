# -*- coding: utf-8 -*-
import re
import json

class html:
    def __init__(self):
        self.table = """
<table class="display compact" id="datatable" style="width:100%;">
    <thead>
        {header}
    </thead>
    <tbody>
        {tbody}
    </tbody>
    {tfoot}
</table>

        """
        self.header = ''
        self.tbody = ''
        self.tfoot = ''
        self.template = 'dashboard.html'

    def create_table(self, head, table, project):
        header = ''
        col_scope = dict(scope='col')
        for each_head in head:
            header += self.wrap(text=each_head, wrap='th', attribute=col_scope) + '\n'
        header = self.wrap(text=header, wrap='tr')
        self.header = header
        pattern = re.compile(r'<!--python table begin-->\s(.*)\s*<!--python table end-->', re.DOTALL)
        prj = re.compile(r'<!--python project begin-->\s(.*)\s*<!--python project end-->', re.DOTALL)
        done = ''
        body = ''
        for row in table:
            cells = ''
            for col in row:
                cells += self.wrap(text=col, wrap='td',) + '\n'
            body += self.wrap(text=cells, wrap='tr') + '\n'
            # print(body)
        my_project = '<span class="badge badge-pill badge-success">{0}</span>'.format(project)
        self.tbody = body
        with open(self.template, 'r') as f:
            context = f.read()
            # print(context)
            prj_matches = prj.findall(context)
            for match in prj_matches:
                # print(match, my_project)
                context = context.replace(match, my_project)
            matches = pattern.findall(context)
            for match in matches:
                done = context.replace(match, self.get_table())
        with open('{}_RPD.html'.format(project), 'w', encoding='utf-8') as f:
            f.write(done)
        print('{}_RPD.html generated successfully'.format(project))
    def get_table(self):
        return self.table.format(header=self.header,
                                 tbody=self.tbody,
                                 tfoot=self.tfoot
                                 )


    @staticmethod
    def wrap(text, wrap, attribute=None):
        attr = ''
        if attribute is not None:
            for key, item in attribute.items():
                attr = ' {}="{}"'.format(key, item)
        # if attr != '':
        return '<{wrap}{attr}> {text} </{wrap}>'.format(wrap=wrap, text=text, attr=attr)
        # else:
        #     return '<{wrap}> {text} </{wrap}>'.format(wrap=wrap, text=text, attr=attr)
    @staticmethod
    def gen_js_script(from_dict, template, write_as):
        pattern = re.compile(r'//python gen js start\s(.*)\s*//python gen js end', re.DOTALL)
        content = ''
        myjson = 'var tableData = {0};\n'.format(json.dumps(from_dict))

        with open(template, 'r') as f:
            content = f.read()
        match = pattern.findall(content)

        for each_match in match:

            content = content.replace(each_match, myjson)

        with open(write_as, 'w') as f:
            f.write(content)

        print('{} generated successfully'.format(write_as))