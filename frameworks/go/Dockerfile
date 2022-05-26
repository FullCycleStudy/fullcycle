FROM golang:latest

WORKDIR /usr/src/app

COPY . .

ENV GOPATH=$HOME/go/

ENV GOROOT=/usr/local/go

ENV PATH=$GOROOT/bin:$PATH

ENV PATH=$PATH:$GOPATH/bin

CMD ["go", "run", "main.go"]
