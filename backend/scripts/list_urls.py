import os
import sys
import django
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_urls():
    urlconf = get_resolver()
    all_urls = list()
    def list_urls(lis, acc=None):
        if acc is None:
            acc = []
        if not lis:
            return
        l = lis[0]
        if isinstance(l, django.urls.URLPattern):
            yield acc + [str(l.pattern)]
        elif isinstance(l, django.urls.URLResolver):
            yield from list_urls(l.url_patterns, acc + [str(l.pattern)])
        yield from list_urls(lis[1:], acc)

    for p in list_urls(urlconf.url_patterns):
        print(''.join(p))

get_urls()
