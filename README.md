# Endpoint Documentation

## Restricted Endpoints

### 1. Airdrop Endpoint
- **Path:** `/airdrop`
- **Description:** Proxies requests to the Express server's airdrop endpoint.
- **Method:** All HTTP methods.
- **Access:** Restricted to specific IP addresses (52.22.11.22, 127.0.0.1).

## Notes
- All endpoints that use SSL are served over HTTPS on port 443.
- HTTP requests are automatically redirected to HTTPS.
- The `/airdrop` endpoints are restricted to requests from specific IP addresses for security purposes.

