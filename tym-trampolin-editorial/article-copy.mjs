// Czech translation of reference/blog-en.md; study claims and source links stay unchanged.
export const articleMeta = {
 cs: {
  title: 'AI, která pomáhá tím, že neporadí',
  description: 'Proč vám méně pomoci od umělé inteligence může pomoci lépe se učit. Přečtěte si výzkum a vyzkoušejte interaktivní 30sekundový minipokus.'
 },
 en: {
  title: 'The AI Trick That Works by Refusing to Help You',
  description: 'Why getting less help from artificial intelligence might actually make you a better student. Read the research and try the interactive 30-second challenge.'
 }
};
export const articleBodyCs = `Umělá inteligence se stala běžnou součástí studia. Studentům umožňuje řešit obtížné úlohy, porozumět složitým tématům a dokončovat zadání rychleji než kdy dřív. Když se zasekneme, odpověď bývá jen pár kliknutí daleko. Přestože AI studium usnadňuje, nedávný výzkum naznačuje, že toto pohodlí může mít nečekanou cenu. Co když nám příliš rychlá pomoc ve skutečnosti brání v učení?

Ve výzkumu publikovaném v roce 2026 Stefanos Poulidis, Hamsa Bastani a Osbert Bastani zkoumali, jak přístup k umělé inteligenci ovlivňuje učení. Po dobu 12 týdnů sledovali více než 200 studentů šachových klubů, kteří se učili s pomocí AI. Obě skupiny dostávaly od AI vedení, ale jedna navíc mohla požádat o pomoc, kdykoli chtěla. Překvapivě se studenti, kteří mohli žádat o dodatečnou pomoc, zlepšili v šachu přibližně **o 30 %, zatímco ti s omezenějším přístupem se zlepšili o 64 %.**

<!-- shake:results -->

Tyto výsledky upozorňují na důležitou součást učení známou jako *produktivní zápas s úlohou*. Když narazíme na obtížný problém a pokusíme se ho vyřešit samostatně, náš mozek musí aktivně pracovat s informacemi, zvažovat různé možnosti a rozpoznávat chyby. Tento proces může být frustrující, ale hraje důležitou roli při rozvíjení porozumění. Když AI okamžitě poskytne odpověď, může někdy odstranit právě to myšlenkové úsilí, díky kterému je učení účinné.

To naštěstí neznamená, že bychom měli přestat používat ChatGPT nebo jiné AI nástroje. Místo toho můžeme změnit způsob, jakým s nimi pracujeme. Jednoduchým nápadem je **pravidlo 30 sekund**: kdykoli narazíte na obtížnou otázku, zkuste ji alespoň 30 sekund řešit sami, než požádáte AI o pomoc. I potom zvažte, zda místo úplného řešení nepožádat jen o drobnou nápovědu, abyste mohli dál postupovat samostatně.

<!-- shake:challenge -->

Výzkumníci sice přímo netestovali 30sekundové čekání, ale tento jednoduchý minipokus převádí hlavní poučení z jejich zjištění do praxe: načasování a množství pomoci mohou být stejně důležité jako pomoc samotná.

AI má obrovský potenciál zlepšit vzdělávání. Její největší přínos ale nemusí spočívat v tom, jak rychle poskytuje odpovědi. Někdy je nejúčinnějším pomocníkem při učení ten, který nás vede k samostatnému přemýšlení, i když to trvá o něco déle.

<!-- shake:closing -->

Možná nejchytřejší AI tutor není ten, který vždy zná odpověď, ale ten, který ví, kdy nám ji nedat.`;

// Exact text-node and accessibility-label translations for the static article features.
const featureCopyCs = {
 'THE RESEARCH':'VÝZKUM',
 'When More Help Led to Less Learning':'Když více pomoci vedlo k menšímu pokroku',
 'More than 200 chess students. Twelve weeks of AI-assisted training. One important difference in how they could request help.':'Více než 200 studentů šachu. Dvanáct týdnů tréninku s AI. Jeden důležitý rozdíl v tom, jak mohli žádat o pomoc.',
 'Chess performance improvement after twelve weeks: 64 percent with system-regulated AI assistance; 30 percent with additional AI assistance on demand. Both groups received automatically timed AI guidance.':'Zlepšení šachového výkonu po dvanácti týdnech: 64 procent s pomocí AI řízenou systémem; 30 procent s dodatečnou pomocí AI na vyžádání. Obě skupiny dostávaly automaticky načasované vedení od AI.',
 'System-regulated<br />AI assistance':'Pomoc AI<br />řízená systémem',
 'Additional AI assistance<br />on demand':'Dodatečná pomoc AI<br />na vyžádání',
 'Chess performance improvement':'Zlepšení šachového výkonu',
 'Both groups received automatically timed AI guidance.':'Obě skupiny dostávaly automaticky načasované vedení od AI.',
 'Only the on-demand group could request extra assistance whenever they wanted.':'Jen skupina s pomocí na vyžádání mohla kdykoli požádat o další pomoc.',
 'Results from a 12-week chess-training study. The 30-second technique presented here is a practical experiment inspired by the findings, not a directly tested intervention.':'Výsledky dvanáctitýdenní studie šachového tréninku. Zde uvedená 30sekundová technika je praktický minipokus inspirovaný zjištěními, nikoli přímo testovaná intervence.',
 'Read the research':'Přečíst výzkum',
 'TRY IT YOURSELF':'VYZKOUŠEJTE SI TO',
 '30 SECONDS':'30 SEKUND',
 'Can You Think for 30 Seconds Without AI?':'Dokážete 30 sekund přemýšlet bez AI?',
 'Before asking for help, give your brain a chance to solve the problem.':'Než požádáte o pomoc, dejte svému mozku šanci úlohu vyřešit.',
 'JavaScript is needed for the timer and hints. You can still read the complete article and copy the study prompt below.':'Časovač a nápovědy potřebují JavaScript. Celý článek si můžete přečíst i bez něj a níže zkopírovat studijní prompt.',
 'A jacket costs €100. Its price increases by 20%, then decreases by 20%. Is the final price €100?':'Bunda stojí 100 €. Její cena se zvýší o 20 % a potom sníží o 20 %. Je výsledná cena 100 €?',
 'Thinking time: 30 seconds remaining':'Čas na přemýšlení: zbývá 30 sekund',
 'THINKING TIME':'ČAS NA PŘEMÝŠLENÍ',
 'Your first instinct':'Vaše první odpověď',
 'Yes, it returns to €100.':'Ano, vrátí se na 100 €.',
 'No, the final price is different.':'Ne, výsledná cena je jiná.',
 "I'm not sure.":'Nevím jistě.',
 'Explain your thinking':'Popište svůj postup',
 '(optional)':'(nepovinné)',
 'What would you calculate first?':'Co byste spočítali jako první?',
 'Start the timer and try the question before looking at a hint.':'Spusťte časovač a zkuste úlohu vyřešit, než se podíváte na nápovědu.',
 'Start My 30 Seconds':'Spustit mých 30 sekund',
 'Submit My Attempt':'Odeslat můj pokus',
 'Step-by-step assistance':'Pomoc krok za krokem',
 'Hint 1':'Nápověda 1',
 'Hint 2':'Nápověda 2',
 'The 20% decrease is calculated from the new, higher price — not the original €100.':'Snížení o 20 % se počítá z nové, vyšší ceny, nikoli z původních 100 €.',
 'First calculate 20% more than €100. Then calculate 20% less than that new amount.':'Nejdřív zvyšte 100 € o 20 %. Potom novou částku snižte o 20 %.',
 'Show Hint 1':'Zobrazit nápovědu 1',
 'The full explanation':'Úplné vysvětlení',
 '€100 × 1.20 × 0.80 = <strong>€96</strong>':'100 € × 1,20 × 0,80 = <strong>96 €</strong>',
 'The increase takes the price to €120. The decrease is 20% of €120 (€24), so it removes more money than the original €20 increase.':'Po zdražení je cena 120 €. Sleva činí 20 % ze 120 € (24 €), takže odečte více peněz než původní zdražení o 20 €.',
 'You just tried the 30-second rule.':'Právě jste vyzkoušeli pravidlo 30 sekund.',
 "The goal wasn't to answer perfectly. It was to make an honest attempt before receiving help.":'Cílem nebyla dokonalá odpověď, ale poctivý vlastní pokus před získáním pomoci.',
 'Start over':'Začít znovu',
 'Continue Reading':'Pokračovat ve čtení',
 'Your answer stays on this page. It is never saved or sent.':'Vaše odpověď zůstává na této stránce. Nikam se neukládá ani neposílá.',
 'Skip the challenge and keep reading':'Přeskočit minipokus a číst dál',
 'HOW THE HELP CHANGES':'JAK SE MĚNÍ POMOC',
 'Same Question. Two Very Different Tutors.':'Stejná otázka. Dva úplně jiní tutoři.',
 'One AI solves the problem for you. The other helps you solve it yourself.':'Jedna AI vyřeší úlohu za vás. Druhá vám pomůže vyřešit ji samostatně.',
 'Compare tutoring styles':'Porovnat způsoby doučování',
 'Instant Answers':'Okamžité odpovědi',
 'Guided Learning':'Učení s vedením',
 'Illustrative scripted conversations. This is not a live AI chat.':'Ilustrační předem napsané rozhovory. Nejde o živý AI chat.',
 'INSTANT ANSWERS':'OKAMŽITÉ ODPOVĚDI',
 'GUIDED LEARNING':'UČENÍ S VEDENÍM',
 'Student':'Student',
 'How do I solve this problem?':'Jak mám tuhle úlohu vyřešit?',
 'The jacket costs €96. First, €100 increases to €120. Then a 20% decrease reduces the price to €96.':'Bunda stojí 96 €. Nejdřív se cena zvýší ze 100 € na 120 €. Potom ji sleva 20 % sníží na 96 €.',
 'Fast and convenient, but the student may skip the reasoning.':'Rychlé a pohodlné, student ale může přeskočit vlastní uvažování.',
 'Before I explain, take 30 seconds to try it yourself. What would you calculate first?':'Než ti to vysvětlím, zkus úlohu 30 sekund řešit sám. Co bys spočítal jako první?',
 'Maybe I should increase €100 by 20%?':'Možná bych měl nejdřív zvýšit 100 € o 20 %?',
 'Exactly. What is the new price, and which amount should the next 20% be calculated from?':'Přesně tak. Jaká je nová cena a z které částky se bude počítat dalších 20 %?',
 'The AI encourages an independent attempt before providing targeted support.':'AI nejdřív vede k samostatnému pokusu a potom nabízí cílenou pomoc.',
 'The Guided Learning example is also included below for readers without JavaScript.':'Pro čtenáře bez JavaScriptu je příklad učení s vedením uveden i níže.',
 'YOUR TURN':'TEĎ VY',
 'Make ChatGPT Refuse to Help You':'Nechte ChatGPT odmítnout okamžitou odpověď',
 "We've prepared a special study prompt inspired by the research. Copy it into ChatGPT and turn your AI assistant into a tutor that encourages you to think before giving you the answer.":'Připravili jsme studijní prompt inspirovaný výzkumem. Zkopírujte ho do ChatGPT a proměňte AI asistenta v tutora, který vás před poskytnutím odpovědi vede k vlastnímu přemýšlení.',
 '30-SECOND STUDY MODE':'STUDIJNÍ REŽIM 30 SEKUND',
 '“Your job is not to think for me.<br /><strong>Your job is to make me think.</strong>”':'„Tvým úkolem není přemýšlet za mě.<br /><strong>Tvým úkolem je přimět mě přemýšlet.</strong>“',
 'Read the complete study prompt':'Přečíst celý studijní prompt',
 'Complete study mode prompt — select and copy':'Celý prompt studijního režimu - vyberte a zkopírujte',
 'Copy Study Mode Prompt':'Zkopírovat studijní prompt',
 'Open ChatGPT':'Otevřít ChatGPT',
 'Expand the complete prompt above, select its text and copy it manually.':'Rozbalte celý prompt výše, vyberte jeho text a ručně jej zkopírujte.',
 'Copy the prompt, then paste it into a new ChatGPT conversation.':'Zkopírujte prompt a vložte jej do nového rozhovoru v ChatGPT.',
 'ChatGPT cannot reliably enforce a real-time waiting period through prompt instructions alone. Use your own timer and share your attempt after 30 seconds.':'Samotné pokyny v promptu nedokážou v ChatGPT spolehlivě vynutit skutečné čekání. Použijte vlastní časovač a svůj pokus odešlete po 30 sekundách.',
 'FURTHER READING':'DALŠÍ ČTENÍ',
 'Research &amp; Sources':'Výzkum a zdroje',
 'The study concerns chess performance. The 30-second activity is an educational adaptation, not an intervention tested in the experiment.':'Studie se týká šachového výkonu. Aktivita na 30 sekund je vzdělávací adaptace, nikoli intervence testovaná v experimentu.',
 'Working paper':'Pracovní verze studie',
 'Stefanos Poulidis, Hamsa Bastani and Osbert Bastani. Working-paper version, revised in 2026.':'Stefanos Poulidis, Hamsa Bastani a Osbert Bastani. Pracovní verze studie, revidovaná v roce 2026.',
 'Published proceedings':'Publikovaný konferenční sborník',
 'Conference proceedings version. DOI: 10.5465/AMPROC.2026.383bp.':'Verze v konferenčním sborníku. DOI: 10.5465/AMPROC.2026.383bp.',
 'An explanation of the study and its implications for AI-assisted learning.':'Vysvětlení studie a jejích důsledků pro učení s pomocí AI.',
 'The researchers explain the experiment, productive struggle and on-demand help.':'Výzkumníci vysvětlují experiment, produktivní zápas s úlohou a pomoc na vyžádání.'
};
const promptEn = `You are my personal AI tutor, and we are using 30-Second Study Mode.

Your goal is to help me genuinely understand what I'm studying rather than simply finish assignments quickly.

Whenever I ask a question or give you a problem, follow these rules:

1. Before giving me an answer, ask me to spend 30 seconds thinking independently. Tell me to start a timer and wait until I send you my attempt.

2. Ask me what I tried, even if I think my answer is wrong.

3. Give me one small hint at a time instead of immediately revealing the complete solution.

4. Help me identify mistakes by asking questions that guide my reasoning.

5. If I remain stuck after making a serious attempt, or explicitly request a complete explanation, explain the solution clearly and step by step.

6. At the end, ask one brief follow-up question to check whether I understand the concept.

Keep your responses natural, concise and supportive. Adapt your explanations to my level.

Your job is not to think for me. Your job is to make me think.

Start by asking which subject or problem I want to work on.`;
featureCopyCs[promptEn] = `Jsi můj osobní AI tutor a používáme studijní režim 30 sekund.

Tvým cílem je pomoci mi skutečně porozumět tomu, co se učím, ne jen rychle dokončit úkoly.

Kdykoli položím otázku nebo ti zadám úlohu, dodržuj tato pravidla:

1. Než mi dáš odpověď, požádej mě, ať 30 sekund přemýšlím samostatně. Řekni mi, ať si spustím časovač, a počkej, dokud ti nepošlu svůj pokus.

2. Zeptej se mě, co jsem zkusil, i když si myslím, že je moje odpověď špatně.

3. Nabízej mi vždy jen jednu drobnou nápovědu, místo abys hned odhalil celé řešení.

4. Pomáhej mi odhalit chyby otázkami, které vedou mé uvažování.

5. Pokud se ani po poctivém pokusu nedokážu posunout, nebo výslovně požádám o úplné vysvětlení, vysvětli řešení jasně a krok za krokem.

6. Na konci polož jednu krátkou doplňující otázku, abys ověřil, zda principu rozumím.

Odpovídej přirozeně, stručně a povzbudivě. Přizpůsob vysvětlení mé úrovni.

Tvým úkolem není přemýšlet za mě. Tvým úkolem je přimět mě přemýšlet.

Začni otázkou, kterému předmětu nebo problému se chci věnovat.`;
const escapePattern = value => [...value].map(char => '\\^$.*+?()[]{}|'.includes(char) ? '\\'+char : char).join('');
const featurePattern = new RegExp(Object.keys(featureCopyCs).sort((a,b)=>b.length-a.length).map(escapePattern).join('|'),'g');
export const localizeArticleFeature = (html,l='en') => l==='cs' ? html.replace(featurePattern,match=>featureCopyCs[match]) : html;
