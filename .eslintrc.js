// NOTE: next build has eslint.ignoreDuringBuilds=true,
// so npm run lint must be run manually or via CI
// before trusting the isolation guarantee.
module.exports = {
  "extends": "next/core-web-vitals",
  "plugins": [
    "boundaries"
  ],
  "settings": {
    "boundaries/elements": [
      {
        "type": "domain",
        "pattern": "src/domains/*/**",
        "capture": [
          "domainName"
        ]
      },
      {
        "type": "shared",
        "pattern": "src/components/shared/**/*"
      },
      {
        "type": "lib",
        "pattern": "src/lib/**/*"
      }
    ]
  },
  "rules": {
    "boundaries/dependencies": [
      "error",
      {
        "default": "allow",
        "message": "Strict Domain Isolation: A domain may not import from another domain.",
        "policies": [
          {
            "from": {
              "element": {
                "type": "domain"
              }
            },
            "disallow": [
              {
                "element": {
                  "type": "domain"
                }
              }
            ]
          },
          {
            "from": {
              "element": {
                "type": "domain"
              }
            },
            "allow": [
              {
                "element": {
                  "type": "domain",
                  "captured": {
                    "domainName": "{{ from.element.captured.domainName }}"
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
};