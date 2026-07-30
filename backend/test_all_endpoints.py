import os
import sys
import django
import re
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from django.urls import get_resolver
from accounts.models import User, Organization
from rest_framework_simplejwt.tokens import RefreshToken

def get_all_urls():
    urlconf = get_resolver()
    all_urls = []
    
    def extract(url_patterns, prefix=''):
        for pattern in url_patterns:
            if hasattr(pattern, 'url_patterns'):
                extract(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                all_urls.append(prefix + str(pattern.pattern))
                
    extract(urlconf.url_patterns)
    # Filter for api routes
    api_urls = [u for u in all_urls if u.startswith('api/')]
    
    clean_urls = []
    for u in api_urls:
        u = u.replace('^', '').replace('$', '').replace('\\.', '.')
        u = '/' + u
        # Replace regex named groups like (?P<pk>[^/.]+) with 1
        u = re.sub(r'\(\?P<[^>]+>[^\)]+\)', '1', u)
        # Replace angle brackets like <pk> or <int:id> with 1
        u = re.sub(r'<[^>]+>', '1', u)
        
        # Ensure it starts with /
        if not u.startswith('/'):
            u = '/' + u
            
        clean_urls.append(u)
        
    return list(set(clean_urls))

def run_fuzzer():
    org, _ = Organization.objects.get_or_create(name='FuzzOrg', slug='fuzzorg')
    user, _ = User.objects.get_or_create(email='fuzz@example.com', defaults={'organization': org, 'role': 'SECURITY_LEAD'})
    user.set_password('fuzzpass')
    user.save()
    
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    
    client = Client(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    urls = get_all_urls()
    errors = []
    
    print(f"Discovered {len(urls)} API endpoints.")
    
    for url in urls:
        print(f"Testing GET {url}")
        try:
            res = client.get(url)
            if res.status_code == 500:
                print(res.content)
                errors.append(f"GET {url} failed with 500")
        except Exception as e:
            errors.append(f"GET {url} crashed: {e}")
            
        print(f"Testing POST {url}")
        try:
            res = client.post(url, data={}, content_type='application/json')
            if res.status_code == 500:
                print(res.content)
                errors.append(f"POST {url} failed with 500")
        except Exception as e:
            errors.append(f"POST {url} crashed: {e}")
            
    if errors:
        print("\n\nFOUND 500 ERRORS:")
        for err in errors:
            print(err)
    else:
        print("\n\nSUCCESS: 0 500 Errors Found.")
        
if __name__ == '__main__':
    run_fuzzer()
