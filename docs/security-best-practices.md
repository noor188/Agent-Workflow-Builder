# Security Best Practices

This document outlines important security considerations for the Agent Workflow Builder.

## API Key Management

### ❌ What NOT to do:
- Never commit API keys directly in source code
- Don't hardcode keys in component files
- Avoid sharing `.env.local` files
- Don't include real keys in documentation or examples

### ✅ Best Practices:
- Use environment variables for all sensitive credentials
- Keep `.env.local` in `.gitignore` (already configured)
- Use different API keys for development, staging, and production
- Regularly rotate API keys
- Use service accounts for Google Sheets instead of personal API keys

## Environment Variable Security

### Client-side Variables (NEXT_PUBLIC_*)
These are **exposed to the browser** and should only contain:
- Non-sensitive configuration
- Public API keys that are meant to be used client-side
- ⚠️ **WARNING**: These will be visible in the compiled JavaScript bundle

### Server-side Variables
These remain **private on the server**:
- Database credentials
- Private API keys (like Google Sheets service account)
- Sensitive configuration

## File Structure

```
.env.example          # Template with placeholder values (safe to commit)
.env.local           # Real credentials (never commit - in .gitignore)
.env.production      # Production credentials (deploy separately)
```

## Deployment Security

### Development
- Use `.env.local` for local development
- Never commit real credentials

### Production
- Use platform-specific environment variable settings
- For Vercel: Use the dashboard to set environment variables
- For other platforms: Set environment variables through their configuration

### Service Account Keys
- Download JSON key files securely
- Store private keys as environment variables
- Use the `extract-credentials.js` script to safely extract credentials
- Delete downloaded JSON files after extracting credentials

## Code Review Checklist

Before committing code, ensure:
- [ ] No hardcoded API keys in source files
- [ ] `.env.local` is not staged for commit
- [ ] Only placeholder values in documentation
- [ ] Environment variables use appropriate prefixes
- [ ] Sensitive data uses server-side variables when possible

## Incident Response

If you accidentally commit API keys:
1. **Immediately revoke** the compromised keys
2. Generate new API keys
3. Update your environment variables
4. Consider rewriting Git history if the commit is recent
5. Monitor for unusual API usage

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Google Cloud Service Account Security](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)

Remember: **Security is everyone's responsibility!** 🔒