/* Shared Tailwind (Play CDN) config for every page.
   Loaded right after the CDN script so all pages use the same design tokens. */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "background": "#141313",
                "surface": "#141313",
                "surface-dim": "#141313",
                "surface-bright": "#3a3939",
                "surface-variant": "#353434",
                "surface-tint": "#c6c6c7",
                "surface-container-lowest": "#0e0e0e",
                "surface-container-low": "#1c1b1b",
                "surface-container": "#201f1f",
                "surface-container-high": "#2a2a2a",
                "surface-container-highest": "#353434",
                "on-background": "#e5e2e1",
                "on-surface": "#e5e2e1",
                "on-surface-variant": "#c4c7c8",
                "inverse-surface": "#e5e2e1",
                "inverse-on-surface": "#313030",
                "outline": "#8e9192",
                "outline-variant": "#444748",
                "primary": "#ffffff",
                "on-primary": "#2f3131",
                "primary-container": "#e2e2e2",
                "on-primary-container": "#636565",
                "primary-fixed": "#e2e2e2",
                "primary-fixed-dim": "#c6c6c7",
                "on-primary-fixed": "#1a1c1c",
                "on-primary-fixed-variant": "#454747",
                "inverse-primary": "#5d5f5f",
                "secondary": "#c9c6c5",
                "on-secondary": "#313030",
                "secondary-container": "#4a4949",
                "on-secondary-container": "#bab8b7",
                "secondary-fixed": "#e5e2e1",
                "secondary-fixed-dim": "#c9c6c5",
                "on-secondary-fixed": "#1c1b1b",
                "on-secondary-fixed-variant": "#474646",
                "tertiary": "#ffffff",
                "on-tertiary": "#303030",
                "tertiary-container": "#e4e2e1",
                "on-tertiary-container": "#656464",
                "tertiary-fixed": "#e4e2e1",
                "tertiary-fixed-dim": "#c8c6c5",
                "on-tertiary-fixed": "#1b1c1c",
                "on-tertiary-fixed-variant": "#474746",
                "error": "#ffb4ab",
                "on-error": "#690005",
                "error-container": "#93000a",
                "on-error-container": "#ffdad6"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "unit": "4px",
                "gutter": "24px",
                "margin-mobile": "16px",
                "margin-desktop": "64px",
                "section-gap": "160px"
            },
            fontFamily: {
                "display-xl": ["Space Grotesk"],
                "display-xl-mobile": ["Space Grotesk"],
                "headline-lg": ["Space Grotesk"],
                "headline-lg-mobile": ["Space Grotesk"],
                "body-md": ["Inter"],
                "label-mono-sm": ["Space Mono"],
                "label-mono-xs": ["Space Mono"]
            },
            fontSize: {
                "display-xl": ["140px", { lineHeight: "120px", letterSpacing: "-0.04em", fontWeight: "600" }],
                "display-xl-mobile": ["64px", { lineHeight: "60px", letterSpacing: "-0.02em", fontWeight: "600" }],
                "headline-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "500" }],
                "headline-lg-mobile": ["32px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "500" }],
                "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "400" }],
                "label-mono-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "500" }],
                "label-mono-xs": ["10px", { lineHeight: "14px", letterSpacing: "0.15em", fontWeight: "400" }]
            }
        }
    }
};
