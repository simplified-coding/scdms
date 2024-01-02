# General

All routes start with a prefix like `certificates` that declare the route group.

## API Scopes

The following scopes have been implemented to SCDMS

- Certificate Management
- Links Management
- Data Protection

## API Routes

### Certificate Management

- POST /certs/generate
- POST /certs/generate/notify
- GET /certs/lookup
- GET /certs/:id/
- DELETE /certs/:id/revoke
