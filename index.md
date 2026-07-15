---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "GoScouter"
  text: "General purpose web analyzer"
  tagline: A fast, no-nonsense toolkit for scouting, probing, and analyzing the net.
  image:
    src: /logo.png
    alt: GoScouter
  actions:
    - theme: brand
      text: Get Started
      link: /get-started
    - theme: alt
      text: Modules
      link: /modules
    - theme: alt
      text: SDK Reference
      link: /sdk

features:
  - icon: 🖥️
    title: Interactive scouting shell
    details: Point gs at a target and drop into a raw-mode terminal where every command runs against that site.
  - icon: 🧭
    title: Batteries-included modules
    details: DNS records, HTTP fingerprinting, certificate-transparency subdomains, and a full-domain scan ship in the box.
  - icon: 🧩
    title: Extensible by design
    details: Modules are standalone executables that speak a tiny JSON protocol, so you can write them in any language.
  - icon: 📦
    title: Install from the registry
    details: Pull community modules by reference with "install author/module@version" — checksummed and cached automatically.
  - icon: 🕸️
    title: Spider-web scans
    details: Crawl a target and its subdomains, then render the findings as an interactive HTML graph.
  - icon: 🐹
    title: Pure Go, cross-platform
    details: A single static binary that builds and runs the same on Linux, macOS, and Windows.
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme';

const member = [
  {
    avatar: 'https://www.github.com/nitayStain.png',
    name: 'Nitay Stain',
    title: 'CEO',
    links: [
      { icon: 'github', link: 'https://github.com/nitayStain' },
      { icon: 'discord', link: 'https://discord.com/users/907644492419571752' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/nitay-stain/' },
      { icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"></path></svg>'
        }, link: 'mailto:nitaystain090@gmail.com' }
    ]
  },
  {
     avatar: 'https://www.github.com/IdanKoblik.png',
     name: 'Idan Koblik',
     title: 'Maintainer',
     links: [
       { icon: 'github', link: 'https://github.com/IdanKoblik' },
       { icon: 'discord', link: 'https://discord.com/users/429212281914785793' },
       { icon: 'linkedin', link: 'https://www.linkedin.com/in/idan-l/' },
       { 
         icon: {
             svg: '<svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"></path></svg>'
         }, 
         link: 'mailto:me@idank.dev' 
       }
     ]
   },
   {
     avatar: 'https://www.github.com/deanx00.png',
     name: 'Dean',
     title: 'Maintainer',
     links: [
       { icon: 'github', link: 'https://github.com/deanx00' },
       { icon: 'discord', link: 'https://discord.com/users/484748555932925959' },
     ]
   }
]
</script>


<style>

.VPTeamMembers > div {
    grid-template-columns: repeat(auto-fit, minmax(204px, 1fr)) !important;
    
}

.image-bg > img {
    border-radius: 30px !important;
}

</style>

<center>
    <VPTeamPageTitle>
        <template #title>Our Team</template>
        <template #lead>The people that makes our projects possible</template>
    </VPTeamPageTitle>
    <VPTeamPageSection>
          <VPTeamMembers
            size="small" :members="member"
          />
    </VPTeamPageSection>
</center>
