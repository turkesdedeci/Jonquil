## Multi-Model Orkestrasyon Protokolü

Bir bug fix, feature request veya karmaşık görev geldiğinde:
### Adım 1 - Codex Analiz & Planlama
Codex MCP tool'unu çağır. Codex'ten şunları iste:
- Sorunun kök neden analizi
- Adım adım çözüm planı
- Hangi dosyaların etkileneceği
- Potansiyel riskler

### Adım 2 - Claude Uygulama
Codex'in planını al ve kendin uygula. Her adımı tamamladıktan sonra test et.

### Adım 3 - Fallback: Codex Uygulama
Eğer 2 denemeden sonra çözemediysen, o adımı Codex MCP'ye delege et.

### Adım 4 - Doğrulama
Sonucu build/test ile doğrula.
