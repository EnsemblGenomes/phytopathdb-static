# phytopathdb-static
Static HTML version of www.phytopathdb.org
## Make the static version
```
./make-static.sh
```
## Build and run Apache docker container
```
docker build -t phytopathdb .
docker run -d -p 80:80 phytopathdb
```
Now browse http://localhost


