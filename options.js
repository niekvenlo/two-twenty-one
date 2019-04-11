var ForbiddenPhrases = JSON.parse(String.raw`[
  [
    "/[,.]/",
    "Commas and periods are not allowed"
  ],
  [
    "/[:;]/",
    "Colons and semicolons are not allowed"
  ],
  [
    "/[!?]/",
    "Exclamation marks and question marks are not allowed"
  ],
  [
    "/[\\(\\)\\[\\]\\{\\}\\<\\>]/",
    "Brackets are not allowed"
  ],
  [
    "/[@#$^*–~‘’]/",
    "Special characters are not allowed"
  ],
  [
    "/^ /",
    "A space at the front is not allowed"
  ],
  [
    "/  /",
    "Double spaces are not allowed"
  ],
  [
    "/\\n/",
    "Line breaks are not allowed"
  ],
  [
    "/\\s&\\w|\\w&\\s/",
    "Use spaces on both sides of the &"
  ],
  [
    "/\\s/\\w|\\w/\\s/",
    "Use spaces on both sides of the /"
  ]
]`);

var ForbiddenPhrasesSwedish = JSON.parse(String.raw`[
  [
    "/accessaorer/",
    "Use 'accessoarer'"
  ],
  [
    "/konstertbiljetter/",
    "Use 'konsertbiljetter'"
  ],
  [
    "/fotölj/",
    "Use 'fåtölj'"
  ],
  [
    "/underhålning/",
    "Use 'underhållning'"
  ]
]`);

var ForbiddenPhrasesDutch = JSON.parse(String.raw`[
  [
    "/\\b(ons|het) biografie/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) agenda\\b/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) industrie/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) innovatie$/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) inventaris/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) kosten/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) matrassen/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) \\w*bedden\\b/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) \\w*school\\b/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) techniek$/i",
    "Onze/de"
  ],
  [
    "/\\b(ons|het) organisatie/i",
    "Onze/de"
  ],
  [
    "/\\b(onze|de) \\w*aanbod\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*centrum\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*systeem\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*werk\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) assortiment\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) buffet$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) onderzoek$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) nieuws$/",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*rooster\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*verblijf\\b/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*materiaal$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) menu$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) maatwerk$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) portfolio$/i",
    "Ons/het"
  ],
  [
    "/\\b(onze|de) \\w*verblijf$/i",
    "Ons/het"
  ],
  [
    "/autos\\b/i",
    "Use an apostrophe"
  ],
  [
    "/collegas/i",
    "Use an apostrophe"
  ],
  [
    "/bureau's/i",
    "Don't use an apostrophe"
  ],
  [
    "/cadeau's/i",
    "Don't use an apostrophe"
  ],
  [
    "/prive/i",
    "Use an accent"
  ],
  [
    "/\\bfohn/i",
    "Use an umlaut"
  ],
  [
    "/\\bcreme\\b/i",
    "Use an accent"
  ],
  [
    "/Noord Brabant/",
    "Use a hyphen"
  ],
  [
    "/\\bebike/i",
    "Use a hyphen"
  ],
  [
    "/waarom/i",
    "Use 'Daarom'"
  ],
  [
    "/material\\b/i"
  ],
  [
    "/Reserveren maken/",
    "Use 'Reservering making'"
  ],
  [
    "/origneel/",
    "Use 'origineel'"
  ],
  [
    "/code95/i"
  ],
  [
    "/^Fysiotherapeut$/",
    "Add a second word"
  ],
  [
    "/^Fysiotherapie$/",
    "Add a second word"
  ],
  [
    "/^Diensten$/",
    "Add a second word"
  ],
  [
    "/^Occasions$/",
    "Add a second word"
  ],
  [
    "/^Publicaties$/",
    "Add a second word"
  ],
  [
    "/^Bedlinnen$/",
    "Add a second word"
  ],
  [
    "/onderhoud dienst/i",
    "Use an 's' instead of a space"
  ],
  [
    "/glas bewassing/i",
    "Remove the space"
  ],
  [
    "/kantoor artikelen/i",
    "Remove the space"
  ],
  [
    "/winkel benodigdheden/i",
    "Remove the space"
  ],
  [
    "/woning ontruiming/i",
    "Remove the space"
  ],
  [
    "/heid artikelen/",
    "Use an 's' instead of a space"
  ],
  [
    "/piano les/i",
    "Remove the space"
  ],
  [
    "/pianos\\b/i",
    "Use 'piano's'"
  ],
  [
    "/vrijwilligers werk/i",
    "Remove the space"
  ],
  [
    "/veel gestelde/i",
    "Remove the space"
  ],
  [
    "/succes verhalen/i",
    "Remove the space"
  ],
  [
    "/chting opties/i"
  ],
  [
    "/doe het zelf/i",
    "Add hyphens"
  ],
  [
    "/aanvraag formulier/i",
    "Remove the space"
  ],
  [
    "/groep aanvraag/i",
    "Use an 's' instead of a space"
  ],
  [
    "/gebruik informatie/i"
  ],
  [
    "/praktijk opleidingen/i"
  ],
  [
    "/\\bIj/",
    "Capitalise both letters: 'IJ'"
  ],
  [
    "/\\bBBQ/",
    "Use lowercase"
  ],
  [
    "/\\bCV\\b/",
    "Use lowercase"
  ],
  [
    "/\\bhr\\b/",
    "Use lowercase"
  ],
  [
    "/\\bPC\\b/",
    "Use lowercase"
  ],
  [
    "/\\bPVC/",
    "Use lowercase"
  ],
  [
    "/\\bRVS\\b/",
    "Use lowercase"
  ],
  [
    "/\\busb\\b/",
    "Use uppercase"
  ],
  [
    "/Woocommerce/"
  ],
  [
    "/atmos/",
    "Capitalise"
  ],
  [
    "/adidas/",
    "Capitalise"
  ],
  [
    "/\\bLease\\b/",
    "Don't use a capital on 'lease'"
  ],
  [
    "/Wi-?Fi/",
    "Use 'wifi'"
  ],
  [
    "/\\bgroup/",
    "Capitalise"
  ],
  [
    "/academy/",
    "Capitalise"
  ],
  [
    "/airport/",
    "Capitalise"
  ],
  [
    "/foundation/",
    "Capitalise"
  ],
  [
    "/\\bflow/"
  ],
  [
    "/\\bflaunt/"
  ],
  [
    "/\\bform\\b/"
  ],
  [
    "/\\bmusic\\b/"
  ],
  [
    "/\\bdegree\\b/"
  ],
  [
    "/\\bproducer/"
  ],
  [
    "/\\bcooper/"
  ],
  [
    "/texel/",
    "Use 'Texel'"
  ],
  [
    "/\\be ?commerce/"
  ],
  [
    "/onxe|huh/i"
  ],
  [
    "/Alle actie$/"
  ],
  [
    "/Advies geven/"
  ],
  [
    "/voor en bij./i"
  ],
  [
    "/maserclass/i"
  ],
  [
    "/orgneel/i"
  ],
  [
    "/kinderen\\w/i"
  ],
  [
    "/accessories/i",
    "Use 'accessoires'"
  ],
  [
    "/accesoires/i",
    "Use 'accessoires'"
  ],
  [
    "/acessoires/i",
    "Use 'accessoires'"
  ],
  [
    "/accesoire/i",
    "Use 'accessoire'"
  ],
  [
    "/acessoire/i",
    "Use 'accessoire'"
  ],
  [
    "/^alle (accommodatie|menu|maatwerk)$/i"
  ],
  [
    "/acommodatie/i",
    "Use 'accommodatie'"
  ],
  [
    "/accomodatie/i",
    "Use 'accommodatie'"
  ],
  [
    "/^alles (\\w*machines)/i"
  ],
  [
    "/lidmaatschapsopties/i"
  ],
  [
    "/abbonn?ement/",
    "Use abonnement"
  ],
  [
    "/ontslag situaties/i"
  ],
  [
    "/praktijk opleidingen/i"
  ],
  [
    "/keuken gerechten/i"
  ],
  [
    "/onderhoud informatie/i"
  ],
  [
    "/kwaliteit informatie/i"
  ],
  [
    "/lokatie/i",
    "Use 'locatie'"
  ],
  [
    "/Zakelijke evenement\\b/i",
    "Use 'zakelijk'"
  ],
  [
    "/Zakelijk evenementen\\b/i",
    "Use 'zakelijke'"
  ],
  [
    "/eierengerechten/i",
    "Use 'eiergerechten'"
  ],
  [
    "/kip gerechten/i",
    "Remove the space"
  ],
  [
    "/zakelijk dienst/i",
    "Use 'zakelijke'"
  ],
  [
    "/Praktijk informatie/i",
    "Remove the space"
  ],
  [
    "/themas's/i",
    "Remove the extra s"
  ],
  [
    "/gallerij/i",
    "Use 'galerij'"
  ],
  [
    "/foto galerij/i",
    "Remove the space"
  ],
  [
    "/nachines?\\b/i",
    "Use 'machine'"
  ],
  [
    "/vaknatie/i",
    "Use 'vakantie'"
  ],
  [
    "/Plak beslag/i",
    "Remove the space"
  ],
  [
    "/Zakelijke \\w*verzoek/i",
    "Use 'zakelijk'"
  ],
  [
    "/verwarmings onderhoud/i",
    "Remove the space"
  ],
  [
    "/\\bvluhten\\b/i",
    "Use 'vluchten'"
  ],
  [
    "/Hoe het werk\\b/i",
    "Use 'Hoe het werkt'"
  ],
  [
    "/Alle collectie\\b/i",
    "Use 'Alle collecties'"
  ],
  [
    "/Streetfood/i",
    "Add a space"
  ],
  [
    "/Winkel zoeker/i",
    "Remove the space"
  ],
  [
    "/Doneren nu/i",
    "Use 'Doneer nu'"
  ],
  [
    "/Alle medewerker/i",
    "Use 'Alle medewerkers' or 'Onze medewerkers'"
  ],
  [
    "/prgramma/i",
    "Use 'Programma'"
  ],
  [
    "/onderhoudplannen/i",
    "Use 'Onderhoudsplannen'"
  ],
  [
    "/Hoe werkt het/i",
    "Use 'How het werkt'"
  ],
  [
    "/assortient/i",
    "Use 'assortiment'"
  ],
  [
    "/regios/i",
    "Use 'regio's'"
  ],
  [
    "/\\w*artikeln/i",
    "Use 'artikelen"
  ],
  [
    "/^Voor te/i",
    "Use 'Om te ...'"
  ],
  [
    "/prijstlijst/i",
    "Use 'prijslijst'"
  ],
  [
    "/opleidinging/i",
    "Use 'opleiding'"
  ],
  [
    "/2de hands/i",
    "Use 'Tweedehands'"
  ],
  [
    "/accugereedschap/i",
    "Add a space"
  ],
  [
    "/jaloezieen/i",
    "Use 'jaloezieën'"
  ]
]`);

var BrandCapitalisation = JSON.parse(String.raw`
[
 "AdWords",
 "iPhone",
 "iPad",
 "iPod",
 "iMac",
 "iBook",
 "iTunes",
 "MacBook",
 "YouTube"
]`);

var CommonReplacementsSwedish = JSON.parse(String.raw`[
  [
    "/contact/i",
    "Kontakta oss"
  ],
  [
    "/about/i",
    "Om oss"
  ],
  [
    "/faq/i",
    "Vanliga frågor"
  ],
  [
    "/log ?in/i",
    "Logga in"
  ],
  [
    "/customer service/i",
    "Vår kundtjänst"
  ],
  [
    "/blog/i",
    "Visa blogg"
  ],
  [
    "/Inspiration/i",
    "Få inspiration"
  ],
  [
    "/^media$/i",
    "Se media"
  ],
  [
    "/products/i",
    "Våra produkter"
  ],
  [
    "/giftcard/i",
    "Köp presentkort"
  ],
  [
    "/my page/i",
    "Mina sidor"
  ],
  [
    "/storefinder|find store/i",
    "Hitta butiker"
  ],
  [
    "/projects/i",
    "Olika projekt"
  ],
  [
    "/store/i",
    "Vår butik"
  ],
  [
    "/webstore/i",
    "Visa webbutik"
  ]
]`);

var CommonReplacementsDutch = JSON.parse(String.raw`[
  [
    "/.*/preise/",
    "Prijzen bekijken"
  ],
  [
    "/.*/bewertungen/",
    "Onze beoordelingen"
  ],
  [
    "/cat popular/i",
    "Populaire gerechten"
  ],
  [
    "/^acties$/i",
    "Huidige acties"
  ],
  [
    "/^agenda/i",
    "Bekijk de agenda"
  ],
  [
    "/^aanmelden/i",
    "Meld je aan"
  ],
  [
    "/^aanbiedingen/i",
    "Allerlei aanbiedingen"
  ],
  [
    "/^(baden)$/i",
    "Diverse $1"
  ],
  [
    "/^brands$|.*\\bmerken.*/i",
    "Merkenoverzicht"
  ],
  [
    "/^(company|about.*|over ?ons)$/i",
    "Over ons"
  ],
  [
    "/^(dames|heren|jongens|meisjes)$/i",
    "$&artikelen"
  ],
  [
    "/^dealers?$/i",
    "Vind een dealer"
  ],
  [
    "/^diensten$/i",
    "Onze diensten"
  ],
  [
    "/^hoe werkt het$/i",
    "Hoe het werkt"
  ],
  [
    "/^wij zijn wij$/i",
    "Wie wij zijn"
  ],
  [
    "/^inspiratie$/i",
    "Doe inspiratie op"
  ],
  [
    "/^login$/i",
    "Log in"
  ],
  [
    "/^make up$/",
    "Make-up opties"
  ],
  [
    "/^oplossingen$/i",
    "Onze $&"
  ],
  [
    "/^service-onderhoud$/i",
    "Service en onderhoud"
  ],
  [
    "/^service$/i",
    "Service krijgen"
  ],
  [
    "/^specials$/i",
    "Onze Specials"
  ],
  [
    "/^prijzen$|^tarieven$/i",
    "Prijsinformatie"
  ],
  [
    "/^private lease$/",
    "Private lease opties"
  ],
  [
    "/^producten$|^products$/i",
    "Alle producten"
  ],
  [
    "/^sale$/i",
    "Huidige sale"
  ],
  [
    "/^smart home/i",
    "Smart Home producten"
  ],
  [
    "/^support$/i",
    "Krijg support"
  ],
  [
    "/^vacatures$/i",
    "Alle vacatures"
  ],
  [
    "/^waarom (.*)/i",
    "Daarom $1"
  ],
  [
    "/^(.*veel ?gestelde.*|faqs?.*)/i",
    "Veelgestelde vragen"
  ],
  [
    "/.*accessoires$|.*accessories$/i",
    "Allerlei accessoires"
  ],
  [
    "/.*all inclusive/i",
    "All inclusive opties"
  ],
  [
    "/.*assortiment.*/i",
    "Ons assortiment"
  ],
  [
    "/.*blog.*/i",
    "Lees onze blog"
  ],
  [
    "/.*contact.*/i",
    "Neem contact op"
  ],
  [
    "/.*foto.?s$/i",
    "Fotoalbum"
  ],
  [
    "/.*last ?minute.*/i",
    "Last minute opties"
  ],
  [
    "/.*nieuwsbrief.*/i",
    "Aanmelden nieuwsbrief"
  ],
  [
    "/.*nieuws\\b.*/i",
    "Lees ons nieuws"
  ],
  [
    "/.*showroom.*/i",
    "Bezoek onze showroom"
  ],
  [
    "/.*offerte.*/i",
    "Vraag een offerte aan"
  ],
  [
    "/.*(projecten|cases)$/i",
    "Enkele $1"
  ],
  [
    "/.*referenties.*/i",
    "Bekijk referenties"
  ],
  [
    "/.*recensies.*/i",
    "Bekijk recensies"
  ],
  [
    "/.*reserveren.*/i",
    "Maak een reservering"
  ],
  [
    "/.*webshop$/i",
    "Bezoek onze webshop"
  ],
  [
    "/curacao/i",
    "Curaçao"
  ],
  [
    "/curaçao/i",
    "Curaçao"
  ],
  [
    "/belgie/i",
    "België"
  ],
  [
    "/italie/i",
    "Italië"
  ],
  [
    "/slovenie/i",
    "Slovenië"
  ],
  [
    "/egeische/i",
    "Egeïsche"
  ],
  [
    "/andalusie/i",
    "Andalusië"
  ],
  [
    "/riviera/i",
    "Rivièra"
  ],
  [
    "/t shirt/i",
    "T-shirt"
  ],
  [
    "/only adult/i",
    "Adult Only reizen"
  ],
  [
    "/burn out/i",
    "burn-out"
  ],
  [
    "/kant en klare/i",
    "kant-en-klare"
  ],
  [
    "/cv ketel/i",
    "cv-ketel"
  ],
  [
    "/fotos\\b/i",
    "foto's"
  ],
  [
    "/accus\\b/i",
    "accu's"
  ],
  [
    "/autos\\b/i",
    "auto's"
  ],
  [
    "/menus/i",
    "menu's"
  ],
  [
    "/paginas\\b/i",
    "pagina's"
  ],
  [
    "/programmas\\b/i",
    "programma's"
  ],
  [
    "/\\bvacuum/i",
    "vacuüm"
  ],
  [
    "/\\bcafe/i",
    "café"
  ],
  [
    "/cafe\\b/i",
    "café"
  ],
  [
    "/e mail/i",
    "e-mail"
  ],
  [
    "/make up/",
    "make-up"
  ],
  [
    "/e commerce/",
    "e-commerce"
  ],
  [
    "/carriere/i",
    "carrière"
  ],
  [
    "/proteine/i",
    "proteïne"
  ],
  [
    "/hygiene/i",
    "hygiëne"
  ],
  [
    "/plisse/i",
    "plissé"
  ],
  [
    "/fohn/i",
    "föhn"
  ],
  [
    "/durum/i",
    "dürüm"
  ],
  [
    "/industriële/i",
    "industriële"
  ],
  [
    "/ieen/i",
    "ieën"
  ],
  [
    "/eeen/i",
    "eeën"
  ],
  [
    "/Noord (Holland|Brabant|Europa|Amerika)/i",
    "Noord-$1"
  ],
  [
    "/Zuid (Holland|Brabant|Europa|Amerika)/i",
    "Noord-$1"
  ],
  [
    "/West (Vlaanderen|Europa)/i",
    "Noord-$1"
  ],
  [
    "/Oost (Vlaanderen|Europa)/i",
    "Noord-$1"
  ],
  [
    "/^ij/i",
    "IJ"
  ],
  [
    "/Amsterdam/i",
    "Amsterdam"
  ],
  [
    "/Rotterdam/i",
    "Rotterdam"
  ],
  [
    "/België/i",
    "België"
  ],
  [
    "/IJselstein/i",
    "IJselstein"
  ],
  [
    "/IJburg/i",
    "IJburg"
  ],
  [
    "/IJsland/i",
    "IJsland"
  ],
  [
    "/Nederland/i",
    "Nederland"
  ],
  [
    "/Utrecht/i",
    "Utrecht"
  ],
  [
    "/Oosterhout/i",
    "Oosterhout"
  ],
  [
    "/Vlugtenburg/i",
    "Vlugtenburg"
  ],
  [
    "/Middellandse Zee/i",
    "Middellandse Zee"
  ],
  [
    "/Texel/i",
    "Texel"
  ],
  [
    "/group/i",
    "Group"
  ],
  [
    "/academy/i",
    "Academy"
  ],
  [
    "/airport/i",
    "Airport"
  ],
  [
    "/home/i",
    "Home"
  ],
  [
    "/^building/i",
    "Building"
  ],
  [
    "/\\bnew\\b/i",
    "/New"
  ],
  [
    "/BMW/i",
    "BMW"
  ],
  [
    "/3D/i",
    "3D"
  ],
  [
    "/EHBO/i",
    "EHBO"
  ],
  [
    "/\\bIT\\b/i",
    "IT"
  ],
  [
    "/\\bICT\\b/i",
    "ICT"
  ],
  [
    "/\\bVIP\\b/i",
    "VIP"
  ],
  [
    "/\\bHP\\b/i",
    "HP"
  ]
]`);

window.onload = function() {
  
  /**
   * Show a quick popup message that quickly disappears.
   *
   * @param {string} msg - The text of the message
   */
  const toast = (function() {
    const toast = document.createElement('div');
    toast.style.backgroundColor = 'black';
    toast.style.bottom = '60px';
    toast.style.boxShadow = '0 0.2em 0.5em #aaa';
    toast.style.color = 'white';
    toast.style.padding = '0.8em 1.2em';
    toast.style.position = 'fixed';
    toast.style.right = '60px';
    toast.style.zIndex = '2001';
    toast.hidden = true;
    document.body.append(toast);
    let ts;
    return function(msg) {
      toast.hidden = false;
      toast.textContent = msg;
      clearTimeout(ts);
      ts = setTimeout(() => {
        toast.textContent = '';
        toast.hidden = true;
      }, 1000);
    };
  })();
  
  /**
   * Add linebreaks and spacing to JSON for legibility.
   *
   * @param {string} json - JSON formatted string.
   * @param {string} JSON formatted string with spacing.
   */
  function prettifyJSON(json) {
    var out = '';
    var depth = 0;
    var inQuote = false;
    for (let char of json) {
      if (!inQuote && (char === ']' || char === '}')) {
        depth--;
        out += '\n' + '  '.repeat(depth);
      }
      out += char;
      if (!inQuote && char === ':') {
        out += ' ';
      }
      if (char === '"') {
        inQuote = !inQuote;
      }
      if (!inQuote && (char === '[' || char === '{')) {
        depth++;
        out += '\n' + '  '.repeat(depth);
      }
      if (!inQuote && char === ',') {
        out += '\n' + '  '.repeat(depth);
      }
    }
    return out;
  }
  
  /**
   * Store data in chrome.storage.local.
   *
   * @param {Object} stores - Map of JSON strings to store as objects.
   */
  function set(stores) {
    for (let store in stores) {
      if (typeof stores[store] !== 'object') {
        throw new Error(`Trying to set ${store} with ${typeof stores[store]}`);
      }
      console.debug(store, stores[store]);
      chrome.storage.local.set({[store]: stores[store]});
    }
  }

  var create = (type, params, style) => {
    const el = document.createElement(type);
    for (let param in params) {
      el[param] = params[param];
    }
    for (let rule in style) {
      el.style[rule] = style[rule];
    }
    return el;
  }
  
  function makeConfigEditor(array) {
    const contain = create('div');
    const title =
        create('div', {className: 'title', textContent: 'Configuration'});
    const fields = create('div', {className: 'fields'}, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    });
    contain.appendChild(title);
    contain.appendChild(fields);
    for (let field of array) {
      const key = create('div', {
        innerText: field.name,
        title: field.description || '...',
      });
      const value = (typeof field.value === 'boolean')
          ? create('input', {
            spellcheck: false,
            type: 'checkbox',
            checked: field.value,
          })
          : create('input', {
            spellcheck: false,
            type: 'text',
            value: field.value,
          });
      value.addEventListener('change', ({target}) => {
        if (field.value === target.value) {
          return;
        }
        if (target.type === 'checkbox') {
          field.value = target.checked;
        } else {
          field.value = target.value;
        }
        set({'Configuration': array});
        toast(`Change saved`);
      });
      fields.appendChild(key);
      fields.appendChild(value);
    }
    document.getElementById('main').append(contain);
  }

  var defaultStores = {
    Configuration: [
      {
        name: 'initials',
        value: '',
        description:
            'Your initials will be automatically added to the comment box.',
      },
      {
        name: 'play beeps on error',
        value: true,
        description:
            'Play a beep for high and medium level warnings. ' +
            '\nBeep repeats every couple of seconds.',
      },
      {
        name: 'use escape-key to approve',
        value: false,
        description:
            'Use the Escape key as a Hotkey to Approve tasks.' +
            '\nRecommended for the Japanese team.',
      },
      {
        name: '12 character limit',
        value: false,
        description:
            'Set the character limit in text boxes to 12.' +
            '\nRecommended for the Japanese team.',
      },
      {
        name: 'keep original capitalisation',
        value: false,
        description:
            'Stops automatic capitalization changes when pasting text.' +
            '\nRecommended for the Japanese team.',
      },
      {
        name: 'use google links',
        value: false,
        description:
            'Experimental: Use the Google internal redirection system.',
      },
    ],
    ForbiddenPhrases,
    ForbiddenPhrasesDutch,
    ForbiddenPhrasesSwedish,
    BrandCapitalisation,
    CommonReplacementsDutch,
    CommonReplacementsSwedish,
  }

  chrome.storage.local.get(null, (stores) => {
    var allStores = {...defaultStores, ...stores};
    const copy = defaultStores['Configuration'].slice();
    allStores['Configuration'] = copy.map(defaultSetting => {
      const storedSetting = allStores['Configuration']
          .find(a => a.name === defaultSetting.name);
      const copy = {...defaultSetting};
      copy.value = storedSetting.value || copy.value;
      return copy;
    });
    set(allStores);
    console.log(allStores);
    makeConfigEditor(allStores['Configuration']);
  });
  
  const feedback = document.createElement('button');
  feedback.textContent = 'Feature request?';
  feedback.title =
      'Any feedback is welcome.' +
      '\nQuestions, comments, concerns';
  feedback.addEventListener('click', () => {
    toast('Opening the feedback form');
    window.open('http://goto.google.com/twotwenty-feedback');
  });
  
  const save = document.createElement('button');
  save.className = 'main';
  save.textContent = 'Save changes';
  save.title =
      'Changes are saved automatically.' +
      'This button is a dummy.';
  save.addEventListener('click', () => {
    toast('All changes saved');
    setTimeout(() => window.location.reload(), 1000);
  });
  
  const reset = document.createElement('button');
  reset.textContent = 'Reset default values';
  reset.title =
      'This will reset all settings to default.' +
      '\nYou will lose your count and your log.' +
      '\nRemember to put your initials back in.';
  reset.addEventListener('click', () => {
    chrome.storage.local.clear();
    set(defaultStores);
    toast('Resetting default values');
    setTimeout(() => window.location.reload(), 1000);
  });
  
  document.getElementById('buttons').append(feedback);
  document.getElementById('buttons').append(save);
  document.getElementById('buttons').append(reset);
};
undefined;
