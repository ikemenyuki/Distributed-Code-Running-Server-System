FROM golang:1.20

WORKDIR /app

COPY . .

RUN go build -o myapp

EXPOSE 8085

CMD ["./myapp"]
