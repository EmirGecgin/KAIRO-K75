# KAIRO K75 — Ürün Landing Page Brief

> Bu dosya Claude Code için proje brief'idir. Projeyi bu dokümana göre, aşağıdaki fazlar sırasıyla kur. Her fazın sonunda dur, tarayıcıda kontrol et ve bana özet ver.

---

## 1. Konsept

**Marka:** KAIRO (tamamen hayali bir marka)
**Ürün:** KAIRO K75 — kablosuz, gasket-mount, %75 düzen mekanik klavye
**Slogan:** *"Every keystroke, engineered."*
**Fiyat:** $189 (ön sipariş)

**Hedef his:** Karanlık bir stüdyoda, ışıkla yontulmuş tek bir ürün. Sinematik, sakin ama her scroll'da bir şey oluyor. Apple ürün sayfası × oyun dünyası × Awwwards.

**Ana fikir:** Ziyaretçi scroll ettikçe klavyeyi *keşfeder*: önce uzaktan görür, sonra klavye katmanlarına ayrılır, sonra ziyaretçi kendi klavyesiyle 3D klavyeye yazar, ışıklarını değiştirir ve sonunda sipariş verir. Site bir broşür değil, bir deneyim.

**Neden klavye:** 3D modeli tamamen kodla (prosedürel) üretilebilir, dışarıdan asset gerekmez. Tuşlar instanced mesh olarak üretilir, böylece "parçalara ayrılma" ve "gerçek klavyeyle etkileşim" efektleri doğal olarak mümkün olur.

**Site dili:** İngilizce (uluslararası portfolyo için).

**Footer'da zorunlu not:** "KAIRO is a fictional brand. Concept project by Emir Geçgin." — portfolyo dürüstlüğü için.

---

## 2. Teknoloji Yığını

| Alan | Teknoloji | Kullanım amacı |
|---|---|---|
| Framework | **Vite + React + TypeScript** | Hızlı dev server, 21st.dev ve Motion ile tam uyum |
| Stil | **Tailwind CSS v4** | Hızlı ve tutarlı stil |
| 3D | **Three.js + React Three Fiber + @react-three/drei** | Prosedürel klavye, ışık, kamera |
| 3D efekt | **@react-three/postprocessing** | Bloom (RGB parlaması), hafif chromatic aberration, vignette |
| Scroll animasyonları | **GSAP + ScrollTrigger + SplitText + @gsap/react (useGSAP)** | Pinlenen sahneler, scrub animasyonlar, harf harf metinler |
| Smooth scroll | **Lenis** | Akıcı scroll, GSAP ticker'a bağlanacak |
| UI animasyonları | **Motion (Framer Motion)** | Hover, butonlar, modal, layout geçişleri, micro-interaction |
| Hazır bileşenler | **21st.dev Magic MCP** | Bento grid, marquee, animasyonlu sayaçlar, CTA bölümleri için başlangıç noktası |
| Tasarım sistemi | **UI UX Pro Max skill** | Renk paleti, font eşleşmesi, spacing kararları |
| Ses (opsiyonel) | **Howler.js** | Tuş sesleri, varsayılan olarak KAPALI |

### Kullanılacak MCP / araçlar
- **Context7 MCP:** GSAP, R3F, Lenis, Motion için güncel dokümantasyonu kontrol et. Eski API kullanma.
- **Playwright MCP:** Her fazdan sonra sayfayı aç, ekran görüntüsü al, animasyonların çalıştığını ve layout'un bozulmadığını kontrol et (masaüstü 1440px + mobil 390px).
- **21st.dev Magic MCP:** Bileşenleri buradan çek ama markanın görsel diline göre mutlaka uyarla; hazır hâliyle bırakma.

---

## 3. Görsel Dil

- **Arka plan:** Neredeyse siyah `#0A0A0B`, hafif noise/grain dokusu (CSS veya shader).
- **Ana metin:** Kırık beyaz `#EDEDED`, ikincil metin `#8A8A8F`.
- **Vurgu rengi:** Elektrik turuncusu `#FF5A1F` (Kairo turuncusu). RGB bölümü hariç sitede tek vurgu rengi bu.
- **Tipografi:**
  - Başlıklar: Büyük, sıkı, geometrik sans (ör. *Clash Display*, *Space Grotesk* veya UI UX Pro Max'in önerisi). Hero başlığı viewport genişliğinin büyük kısmını kaplamalı.
  - Gövde: *Inter* veya benzeri temiz sans.
  - Teknik etiketler: Monospace (*JetBrains Mono*), büyük harf, geniş harf aralığı.
- **Işık:** Ürün her zaman dramatik stüdyo ışığında; rim light + turuncu accent light.
- **Özel imleç:** Küçük daire, hover'da büyür ve `mix-blend-mode: difference` kullanır. Butonlar magnetic (imlece doğru çekilir).

---

## 4. Bölümler (Sayfa Akışı)

### 00 — Preloader
- Ortada 000 → 100 sayaç (monospace).
- Altında "KAIRO" harfleri tek tek, tuşa basılıyormuş gibi (aşağı-yukarı zıplama) belirir.
- Bitince ekran ortadan ikiye yarılarak açılır (clip-path), hero görünür.

### 01 — Hero
- Karanlık sahnede havada süzülen K75, yavaşça nefes alır gibi yukarı-aşağı hareket eder.
- Mouse hareketiyle klavye hafifçe eğilir (parallax tilt, lerp ile yumuşak).
- Dev başlık "ENGINEERED." SplitText ile harf harf maskeden yukarı kayarak gelir.
- Altta küçük "Scroll to explore" göstergesi.
- Klavyenin altında yumuşak turuncu yansıma.

### 02 — Exploded View (sitenin yıldızı)
- Bölüm pinlenir (yaklaşık 300vh scroll süresi), animasyon scroll'a scrub ile bağlıdır.
- Klavye yatay pozisyona döner, sonra katmanlar dikey olarak ayrılır:
  1. Keycaps
  2. Switches
  3. Plate
  4. Gasket'ler
  5. PCB
  6. Case
- Her katman ayrıldığında yanında ince çizgiyle bağlı bir etiket belirir (isim + tek satır açıklama).
- Kamera hafifçe etrafında döner.
- Scroll devam ettikçe katmanlar tekrar birleşir ve "click" hissiyle oturur.

### 03 — "Type on it" (etkileşim bölümü)
- Başlık: *"Go ahead. Type something."*
- Ziyaretçi kendi gerçek klavyesinde bir tuşa bastığında 3D klavyede aynı tuş aşağı iner ve turuncu parlar.
- Yazılan metin sahnenin üstünde büyük tipografiyle görünür.
- Ses için küçük bir toggle (varsayılan kapalı).
- Mobilde: ekrandaki 3D tuşlara dokunarak aynı etki.

### 04 — Switches (yatay scroll)
- Dikey scroll yatay harekete dönüşür (pinlenmiş yatay track).
- 3 switch kartı: **Linear / Tactile / Clicky**.
- Her kartta: büyük bir switch görseli (prosedürel 3D veya SVG), actuation force, travel mesafesi, ses karakteri.
- Kartlar ekrana girerken hafif 3D perspektif dönüşüyle gelir.

### 05 — Light it up (RGB bölümü)
- Sahne kararır, yalnızca klavye ışıklarıyla aydınlanır.
- Kullanıcı bir renk paletinden seçim yapar (5–6 hazır renk + "wave" modu).
- Seçim yapıldığında ışık tuşlara dalga hâlinde yayılır (klavyenin bir ucundan diğerine gecikmeli geçiş).
- Bloom efekti burada en güçlü hâlinde.

### 06 — Specs (bento grid)
- Asimetrik bento grid (21st.dev'den başla, uyarla).
- Hücreler: Batarya (sayaç 0 → 4000 mAh), Bağlantı (2.4GHz / Bluetooth / USB-C), Polling rate (1000 Hz), Ağırlık, Malzeme (alüminyum kasa), Hot-swap.
- Sayılar viewport'a girince sayarak yükselir.
- Hücreler hover'da hafif büyür ve border'da turuncu gradient dolaşır.

### 07 — Colorways
- 3 renk seçeneği: **Obsidian** (siyah), **Arctic** (beyaz), **Ember** (turuncu aksanlı).
- Seçince 3D klavyenin materyali yumuşakça geçiş yapar, arka plan rengi de uyumlu şekilde değişir.

### 08 — CTA (Pre-order)
- Dev metin: *"Your next keystroke starts here."*
- Fiyat + magnetic "Pre-order" butonu.
- Butona hover'da arka planda klavye tuşları yağmur gibi düşer (hafif parçacık efekti).
- Butona tıklanınca küçük bir modal: "This is a concept project — thanks for exploring!"

### 09 — Footer
- Ekran genişliğinde dev "KAIRO" wordmark'ı; scroll'la aşağıdan yukarı açılır.
- Basit linkler ve zorunlu konsept notu (bkz. Konsept bölümü).

---

## 5. 3D Klavye (Prosedürel Model)

- Dışarıdan model **kullanma**; tamamen kodla üret.
- %75 düzen: yaklaşık 84 tuş. Düzeni bir veri dizisi olarak tanımla (satır, genişlik birimi: 1u, 1.25u, 1.5u, 1.75u, 2u, 2.25u, 6.25u space).
- Keycap'ler: drei `RoundedBox` geometrisi + `InstancedMesh` (performans için).
- Katmanlar (keycaps, switches, plate, gasket, PCB, case) ayrı gruplar olsun ki exploded view'de bağımsız hareket edebilsinler.
- Her tuşun kendi emissive değeri olsun (RGB ve "type on it" bölümleri için instance color/attribute kullan).
- Birkaç vurgu tuşu (Esc, Enter, Space) turuncu olsun.
- Tek bir `<Canvas>` kullan; bölümler arası geçişte klavye aynı sahnede kalsın, kamera ve klavye pozisyonu scroll'a göre değişsin. Gerekirse drei `View` veya sabit (fixed) bir canvas arkasına HTML bölümleri koy.

---

## 6. Performans ve Erişilebilirlik Kuralları

- DOM animasyonlarında yalnızca `transform` ve `opacity` kullan.
- GSAP animasyonlarını `useGSAP` içinde oluştur; component unmount olduğunda otomatik temizlensin.
- Lenis'i GSAP ticker'a bağla, ScrollTrigger ile senkron çalışsın.
- Canvas için `dpr={[1, 2]}`; ekranda görünmeyen bölümlerde render'ı azalt (`frameloop="demand"` veya görünürlük kontrolü).
- Fontları preload et, layout shift olmasın.
- `prefers-reduced-motion` aktifse: smooth scroll kapalı, pinleme ve büyük hareketler yerine basit fade'ler.
- Mobil (< 768px): postprocessing'i hafiflet, exploded view daha kısa olsun, özel imleç kapalı.
- Hedef: Lighthouse performans skoru masaüstünde 85+, mobilde 70+.
- Klavye etkileşimleri form alanlarına odaklanılmışken tetiklenmesin.

---

## 7. Proje Yapısı (öneri)

```
src/
  components/
    canvas/        # Scene, Keyboard, Keycap, Lights, Effects
    sections/      # Preloader, Hero, Exploded, TypeOnIt, Switches, RGB, Specs, Colorways, CTA, Footer
    ui/            # Cursor, MagneticButton, SplitHeading, Counter
  data/
    layout75.ts    # Klavye düzeni verisi
    content.ts     # Bölüm metinleri
  hooks/
    useLenis.ts
    useKeyPress.ts
  store/
    useSceneStore.ts   # Aktif renk, colorway, basılı tuşlar (Zustand)
  styles/
```

Global state için **Zustand** kullan (3D sahne ile HTML bölümleri arasında renk/colorway/tuş durumunu paylaşmak için).

---

## 8. Uygulama Fazları

Her fazın sonunda dur, Playwright ile ekran görüntüsü al, ne yaptığını özetle ve onayımı bekle.

1. **Kurulum:** Vite + React + TS + Tailwind, tüm paketler, Lenis + GSAP entegrasyonu, font ve renk değişkenleri, boş bölüm iskeleti, özel imleç.
2. **3D klavye:** Prosedürel klavye modeli, ışıklandırma, postprocessing, hero'da süzülme ve mouse tilt.
3. **Preloader + Hero:** Sayaç, harf animasyonları, açılış geçişi, SplitText başlık.
4. **Exploded View:** Pinlenmiş scroll, katman ayrılması, etiketler, kamera hareketi.
5. **Type on it + RGB:** Gerçek klavye etkileşimi, ışık dalgası, renk seçici.
6. **Switches + Specs + Colorways:** Yatay scroll, bento grid, sayaçlar, materyal geçişi.
7. **CTA + Footer:** Magnetic buton, tuş yağmuru, dev wordmark.
8. **Cilalama:** Mobil uyum, reduced motion, performans optimizasyonu, Lighthouse ölçümü, son kontrol.

---

## 9. Başarı Kriterleri

- Sayfayı açan biri ilk 5 saniyede "bu nasıl yapılmış?" demeli.
- Her bölümde en az bir anlamlı hareket olmalı ama hiçbiri rastgele olmamalı; hepsi "klavyeyi keşfetme" fikrine hizmet etmeli.
- Scroll her zaman akıcı olmalı (60fps hedefi), takılma olmamalı.
- Mobilde de etkileyici ve kullanılabilir olmalı.
- Kod okunabilir ve bileşenlere ayrılmış olmalı; her animasyonu bana açıklayabilmelisin.

---

## 10. Çalışma Notu

Bu projeyi öğrenmek için yapıyorum. Karmaşık animasyonları (özellikle ScrollTrigger timeline'ları ve R3F tarafı) yazdıktan sonra kısaca açıkla: ne yaptığını ve neden o yolu seçtiğini.
