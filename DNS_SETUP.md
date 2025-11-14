# DNS Records for Resend Email Setup

Add these DNS records in your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

## 1. TXT Record - DKIM Authentication
**Type:** TXT
**Name:** resend._domainkey
**Value:** p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDiIOHDO3YTm2R1B5a3hCfuttO6lRiCWcC1guc5gwDHLucW2RyuqR9Xh8kVeCzUjhnFUEi1hTvHovEVacOHZUFs10tR9ZliWPMofz/9V9rey2Vs2NCbCaIvPHsfd5y3huF+Idey28DYSRZXQGLK+D2/utf4zuG+0pc7uxeisnegkQIDAQAB
**TTL:** Auto (or 3600)

## 2. MX Record - Return Path
**Type:** MX
**Name:** send (or send.auctusventures.com)
**Value:** feedback-smtp.us-east-1.amazonses.com
**Priority:** 10
**TTL:** Auto (or 3600)

## 3. TXT Record - SPF
**Type:** TXT
**Name:** send (or send.auctusventures.com)
**Value:** v=spf1 include:amazonses.com ~all
**TTL:** Auto (or 3600)

## 4. TXT Record - DMARC (Optional but Recommended)
**Type:** TXT
**Name:** _dmarc (or _dmarc.auctusventures.com)
**Value:** v=DMARC1; p=none;
**TTL:** Auto (or 3600)

---

## After Adding DNS Records:

1. **Wait 10-60 minutes** for DNS propagation
2. **Go back to Resend dashboard** and click "Verify Domain"
3. Once verified, **update the API** to use your domain:
   - Change `from: 'onboarding@resend.dev'` 
   - To: `from: 'noreply@send.auctusventures.com'`
   - Or: `from: 'Auctus Contact <contact@send.auctusventures.com>'`

## Notes:
- The "send" subdomain means emails will come from @send.auctusventures.com
- If you want @auctusventures.com, use @ or root for the Name field instead of "send"
- DNS changes can take up to 24 hours but usually complete within an hour
