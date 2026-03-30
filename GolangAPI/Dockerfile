FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install reflex for hot-reloading (optional) if needed or just copy files
COPY go.mod ./
# Note: we skip go.sum and downloading here since we'll generate it inside the container on first run later or use `go mod tidy` in a script.
# For simplicity, we just copy everything.
COPY . .

# Initialize/Tidy go modules (since we don't have go installed on the host)
RUN go mod tidy

# Build the application
RUN go build -o main ./cmd/api/main.go

FROM alpine:latest
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
