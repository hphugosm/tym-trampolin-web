// Public work facts only. Personal information deliberately remains unfilled.
// Sources: reference/site.ts (team, project authors, timeline) and the established
// fourth-member identity in this project's About page. Archive team photographs
// are not assigned as individual portraits.
export const members = [
  {
    id: 'hugo-kubicek',
    name: 'Hugo Kubíček',
    initials: 'HK',
    role: {cs: 'Vedoucí týmu', en: 'Team lead'},
    intro: {
      cs: 'Tvoří technologické a kreativní projekty v tomto portfoliu. S Danem a Vojtou se zapojil do DemocraTIConu.',
      en: 'Builds the technology and creative projects in this portfolio. Competed in DemocraTICon with Dan and Vojta.'
    },
    projectIds: ['clearmessage', 'real-estate-video', 'website-studies', 'doom-bounce', 'education-tools', 'ai-radio'],
    contribution: {
      cs: 'Autor všech šesti projektů v portfoliu. Na DemocraTIConu pracoval s Danielem Voženílkem a Vojtěchem Čakrtem; v celostátním finále tým reprezentoval společně s Danielem.',
      en: 'Author of all six portfolio projects. Worked on DemocraTICon with Daniel Voženílek and Vojtěch Čakrt; represented the team at the national final with Daniel.'
    },
    personalLife: null,
    personalInterests: [],
    personalAchievements: [],
    sourceNotes: ['reference/site.ts: team[0], all project authors, DemocraTICon national-final timeline entry.']
  },
  {
    id: 'daniel-vozenilek',
    name: 'Daniel Voženílek',
    initials: 'DV',
    role: {cs: 'Člen týmu', en: 'Team member'},
    intro: {
      cs: 'S Hugem a Vojtou pracoval na DemocraTIConu a reprezentoval tým v celostátním finále.',
      en: 'Worked on DemocraTICon with Hugo and Vojta and represented the team at the national final.'
    },
    projectIds: [],
    contribution: {
      cs: 'Společná účast na DemocraTIConu 2026 s Hugem Kubíčkem a Vojtěchem Čakrtem. V celostátním finále v Olomouci reprezentoval tým s Hugem.',
      en: 'Joint participation in DemocraTICon 2026 with Hugo Kubíček and Vojtěch Čakrt. Represented the team with Hugo at the national final in Olomouc.'
    },
    personalLife: null,
    personalInterests: [],
    personalAchievements: [],
    sourceNotes: ['reference/site.ts: team[1], DemocraTICon national-final timeline entry. No portfolio project is attributed to Daniel in the project author data.']
  },
  {
    id: 'vojtech-cakrt',
    name: 'Vojtěch Čakrt',
    initials: 'VČ',
    role: {cs: 'Člen týmu', en: 'Team member'},
    intro: {
      cs: 'S Hugem a Danem pracoval na týmové účasti v DemocraTIConu.',
      en: 'Worked on the team’s DemocraTICon entry with Hugo and Dan.'
    },
    projectIds: [],
    contribution: {
      cs: 'Společná účast na DemocraTIConu 2026 s Hugem Kubíčkem a Danielem Voženílkem.',
      en: 'Joint participation in DemocraTICon 2026 with Hugo Kubíček and Daniel Voženílek.'
    },
    personalLife: null,
    personalInterests: [],
    personalAchievements: [],
    sourceNotes: ['reference/site.ts: team[2]. The national-final timeline names Hugo and Daniel as the team representatives; no final attendance is asserted for Vojtěch.']
  },
  {
    id: 'honza-smrz',
    name: 'Honza Smrz',
    initials: 'HS',
    role: {cs: 'Člen týmu', en: 'Team member'},
    intro: {cs: 'Člen Týmu Trampolín.', en: 'Member of Team Trampolin.'},
    projectIds: [],
    contribution: {cs: 'Člen týmu.', en: 'Team member.'},
    personalLife: null,
    personalInterests: [],
    personalAchievements: [],
    sourceNotes: ['Established fourth-member name and membership only. No role beyond membership, project contribution, competition participation, portrait, or personal biography has been supplied.']
  }
];

export const getMember = id => members.find(member => member.id === id);
