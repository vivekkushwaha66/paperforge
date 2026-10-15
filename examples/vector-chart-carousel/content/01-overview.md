---
title: "High-Throughput Request Ingress"
order: 1
background: "#0B0F19"
accent_color: "#DFBA87"
---

# High-Throughput Request Ingress

The modern ingress layer unifies **Anycast BGP routing**, TLS 1.3 termination, and distributed rate-limiting into a single predictable vector boundary.

<svg width="680" height="280" viewBox="0 0 680 280">
  <rect width="680" height="280" rx="14" fill="#111625" stroke="#DFBA87" stroke-width="2"/>
  
  <!-- Ingress Client -->
  <rect x="30" y="90" width="120" height="80" rx="8" fill="#1E293B" stroke="#DFBA87" stroke-width="1.5"/>
  <text x="90" y="125" fill="#DFBA87" font-family="Helvetica" font-size="13" font-weight="bold" text-anchor="middle">Mobile / Web</text>
  <text x="90" y="145" fill="#94A3B8" font-family="Helvetica" font-size="11" text-anchor="middle">HTTP/3 QUIC</text>
  
  <!-- Arrow 1 -->
  <path d="M 150 130 L 220 130" stroke="#DFBA87" stroke-width="2.5" fill="none"/>
  
  <!-- Edge CDN -->
  <rect x="220" y="70" width="160" height="120" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
  <text x="300" y="105" fill="#38BDF8" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Anycast Edge CDN</text>
  <text x="300" y="130" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">WAF + DDoS Mitigation</text>
  <text x="300" y="150" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">&lt; 15ms TTFB Globally</text>
  
  <!-- Arrow 2 -->
  <path d="M 380 130 L 460 130" stroke="#38BDF8" stroke-width="2.5" fill="none"/>
  
  <!-- Envoy Gateway -->
  <rect x="460" y="70" width="180" height="120" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="1.5"/>
  <text x="550" y="105" fill="#34D399" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Envoy Proxy Mesh</text>
  <text x="550" y="130" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Mutual TLS (mTLS)</text>
  <text x="550" y="150" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Upstream Connection Pooling</text>

  <!-- Bottom Metric -->
  <text x="340" y="240" fill="#DFBA87" font-family="Helvetica" font-size="12" font-weight="bold" text-anchor="middle">99.999% Availability &bull; Zero Single Points of Failure &bull; Infinite Scale</text>
</svg>

- **Vector Rendering:** Rendered directly to PDF vectors via PDFKit SVG engine.
- **Latency Guarantee:** Sub-millisecond connection handshakes with pre-warmed sockets.
