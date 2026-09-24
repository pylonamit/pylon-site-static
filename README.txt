pylonlending.com — static 1:1 clone (captured 2026-09-24, 1440px desktop)

Open any index.html directly (file://) or serve the folder:  npx serve .
Pages:      ./index.html and one folder per route (about/, brokers/, resources/<slug>/ ...)
Assets:     ./assets/  compiled CSS, fonts, every image at its largest size, .riv animations
Live parts: hero gradient ribbon = the site's real WebGL shader (assets/pylon-runtime.js)
            product animations   = real Rive runtime (assets/rive.min.js) + the .riv files
Static:     scroll-reveal / marquee / counter motion is captured in its finished state
Source:     github.com/braidlending/pylonlending.com (Next.js + WordPress CMS)
