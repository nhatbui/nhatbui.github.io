
# Python Networking

* [Requests](http://docs.python-requests.org/en/master/) - Developer Ergonomics
    * less lines of code
    * work done by [adapters](https://github.com/requests/requests/blob/master/requests/adapters.py#L388) which is a wraps [urllib3](https://urllib3.readthedocs.io/en/latest/) methods
* [urllib3](https://urllib3.readthedocs.io/en/latest/) - Object-oriented networking
    * Connection pools
    * wraps [httplib](https://docs.python.org/2/library/httplib.html) methods
* [httplib](https://docs.python.org/2/library/httplib.html) (named `http` in Python3)
    * implements HTTP protocol
    * [source](https://github.com/python/cpython/tree/master/Lib/http) 
