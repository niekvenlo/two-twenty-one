var ForbiddenPhrases = String.raw`[
  [
    "/\\s&\\w|\\w&\\s/",
    "Use spaces on both sides of the &"
  ],
  [
    "/\\s/\\w|\\w/\\s/",
    "Use spaces on both sides of the /"
  ],
  [
    "/[,;]/",
    "Commas, semicolons and periods are not allowed"
  ],
  [
    "/  /",
    "Double spaces are not allowed"
  ]
]`;
var ForBiddenPhrasesDutch = String.raw`[
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
    "/\\b(onze|de) buffet$/i"
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
    "Use origineel"
  ],
  [
    "/code95/i"
  ],
  [
    "/accessories/i",
    "Use 'accessoires'"
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
    "/\\bUSB\\b/",
    "Use lowercase"
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
    "/.Lease/",
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
    "/degree/"
  ],
  [
    "/\\bproducer/"
  ],
  [
    "/\\bcooper/"
  ],
  [
    "/texel/",
    "Capitalise"
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
    "/accesoires/i",
    "Use acceSSoires"
  ],
  [
    "/acessoires/i",
    "Use aCCessoires"
  ],
  [
    "/^alle (accommodatie|menu|maatwerk)$/i"
  ],
  [
    "/acommodatie/i",
    "Use aCCommodatie"
  ],
  [
    "/accomodatie/i",
    "Use accoMModatie"
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
    "/dames ondergoed/i",
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
  ]
]`;
var BrandCapitalisation = String.raw`
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
]`;
var CommonReplacementsDutch = String.raw`[
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
    "/^brands$|.*\bmerken.*/i",
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
    "/.*nieuws\b.*/i",
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
    "/fotos\b/i",
    "foto's"
  ],
  [
    "/accus\b/i",
    "accu's"
  ],
  [
    "/autos\b/i",
    "auto's"
  ],
  [
    "/\bvacuum/i",
    "vacuüm"
  ],
  [
    "/\bcafe/i",
    "café"
  ],
  [
    "/cafe\b/i",
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
    "/building/i",
    "Building"
  ],
  [
    "/\bnew\b/i",
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
    "/\bIT\b/i",
    "IT"
  ],
  [
    "/\bICT\b/i",
    "ICT"
  ],
  [
    "/\bVIP\b/i",
    "VIP"
  ],
  [
    "/\bHP\b/i",
    "HP"
  ]
]`;

/**
 * @param {Object} stores - Map of JSON strings to store as objects.
 */
function set(stores) {
  for (let store in stores) {
    chrome.storage.local.set({[store]: JSON.parse(stores[store])});
  }
}

// chrome.storage.local.clear();

set({
  ForbiddenPhrases,
  ForBiddenPhrasesDutch,
  BrandCapitalisation,
  CommonReplacementsDutch,
});

chrome.storage.local.get(null, (data) => {
  document.getElementById('main').textContent = 'Data loaded into memory';
  console.log('Data loaded:', data);
});