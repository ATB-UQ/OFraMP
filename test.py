from requests import get, post

response = post("https://fragments.atb.uq.edu.au/fdb/fragments/repos/")
print(response.text)
