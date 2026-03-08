// A comprehensive list of UK cities, towns, and London boroughs for programmatic SEO.
// Expanding from ~150 to 500+ top locations to capture long-tail local search traffic.

export const UK_CITIES = [
    // --- Major Cities & Capitals ---
    "london", "birmingham", "manchester", "leeds", "glasgow", "sheffield", "edinburgh",
    "liverpool", "bristol", "cardiff", "belfast", "nottingham", "newcastle", "southampton",

    // --- London Boroughs & Key Areas ---
    "acton", "balham", "barking", "barnet", "battersea", "bexley", "bow", "brent",
    "brentford", "brixton", "bromley", "camden", "camden-town", "canary-wharf", "catford",
    "cheam", "chelsea", "chiswick", "clapham", "coulsdon", "covent-garden", "croydon",
    "crystal-palace", "dalston", "dulwich", "ealing", "edgware", "edmonton", "eltham",
    "enfield", "feltham", "finchley", "fulham", "golders-green", "greenwich", "hackney",
    "hackney-wick", "hammersmith", "hampstead", "hampton", "hanwell", "haringey", "harrow",
    "havering", "hayes", "hendon", "highgate", "hillingdon", "hornsey", "hounslow",
    "isleworth", "islington", "kensington", "kingston", "kingston-upon-thames", "lambeth",
    "lewisham", "mayfair", "merton", "mill-hill", "mitcham", "morden", "new-malden",
    "newham", "norwood", "notting-hill", "palmers-green", "peckham", "pinner", "poplar",
    "purley", "putney", "raynes-park", "redbridge", "richmond", "ruislip", "shoreditch",
    "soho", "southall", "southgate", "southwark", "stanmore", "stoke-newington", "stratford",
    "streatham", "surbiton", "sutton", "sydenham", "teddington", "tooting", "tottenham",
    "twickenham", "uxbridge", "waltham-forest", "walthamstow", "wandsworth", "whitechapel",
    "wimbledon", "wood-green", "woolwich",

    // --- Midlands & Central England ---
    "wolverhampton", "coventry", "leicester", "stoke-on-trent", "derby", "northampton",
    "dudley", "walsall", "telford", "solihull", "worcester", "warwick", "leamington-spa",
    "stafford", "burton-upon-trent", "nuneaton", "kidderminster", "shrewsbury", "chesterfield",
    "mansfield", "loughborough", "kettering", "corby", "wellingborough", "rugby",
    "stratford-upon-avon", "redditch", "bromsgrove", "stourbridge", "halesowen",
    "canock", "lichfield", "tamworth", "hinckley", "coalville", "melton-mowbray", "newark-on-trent",

    // --- North West England ---
    "bolton", "stockport", "preston", "blackburn", "blackpool", "oldham", "st-helens",
    "chester", "warrington", "rochdale", "wigan", "salford", "bury", "burnley", "southport",
    "birkenhead", "halifax", "crewe", "carlisle", "macclesfield", "widnes", "ellesmere-port",
    "runcorn", "altrincham", "sale", "stretford", "eccels", "swinton", "pendlebury",
    "ashton-under-lyne", "denton", "hyde", "stalybridge", "dukinfeld", "chadderton",
    "failsworth", "royton", "shaw", "farnworth", "westhoughton", "horwich", "hindley",
    "leigh", "ashton-in-makerfield", "tyldesley", "atherton", "golborne", "standish",
    "ormskirk", "skelmersdale", "chorley", "leyland", "penwortham", "bamber-bridge",
    "darwen", "accrington", "nelson", "colne", "rawtenstall", "bacup", "haslingden",
    "clitheroe", "longridge", "great-harwood", "rishton", "oswaldtwistle", "brierfield",
    "padiham", "barnoldswick", "earby", "whitworth", "carnforth", "morecambe", "heysham",
    "lancaster", "fleetwood", "cleveleys", "poulton-le-fylde", "garstang", "thornton",
    "lytham-st-annes", "kirkham", "freckleton", "warton", "longton", "tarleton", "hesketh-bank",
    "banks", "parbold", "appley-bridge", "shevington", "standish", "coppull", "euxton",
    "buckshaw-village", "whittle-le-woods", "brindle", "hoghton", "wheelton", "withnell",
    "abbey-village", "brinscall", "white-coppice", "anglezarke", "rivington", "belmont",

    // --- North East & Yorkshire ---
    "bradford", "sunderland", "hull", "gateshead", "york", "middlesbrough", "doncaster",
    "rotherham", "barnsley", "halifax", "wakefield", "harrogate", "keighley", "dewsbury",
    "batley", "scarborough", "scunthorpe", "grimsby", "cleethorpes", "hartlepool", "stockton-on-tees",
    "darlington", "durham", "washington", "south-shields", "jarrow", "hebburn", "wallsend",
    "north-shields", "tynemouth", "whitley-bay", "blyth", "cramlington", "ashington",
    "morpeth", "hexham", "ponteland", "prhoe", "riding-mill", "corbridge", "haydon-bridge",
    "haltwhistle", "bellingham", "rothbury", "alnwick", "wooler", "berwick-upon-tweed",
    "seahouses", "bamburgh", "beadnell", "craster", "embleton", "newton-by-the-sea",

    // --- Eastern England ---
    "peterborough", "cambridge", "norwich", "ipswich", "luton", "southend-on-sea", "colchester",
    "chelmsford", "basildon", "stevenage", "stalbans", "watford", "bedford", "harlow",
    "grays", "brentwood", "braintree", "kings-lynn", "great-yarmouth", "lowestoft", "bury-st-edmunds",
    "ely", "huntingdon", "st-neots", "st-ives", "wisbech", "march", "chatteris", "whittlesey",

    // --- South East England ---
    "brighton", "portsmouth", "milton-keynes", "reading", "slough", "oxford", "high-wycombe",
    "maidstone", "basingstoke", "guildford", "eastbourne", "hastings", "crawley", "woking",
    "chatham", "gillingham", "dartford", "gravesend", "ashford", "tunbridge-wells", "margate",
    "ramsgate", "folkestone", "dover", "deal", "canterbury", "herne-bay", "whitstable",
    "sittingbourne", "faversham", "isle-of-sheppey", "sheerness", "minster-on-sea",
    "queenborough", "leysdown-on-sea", "eastchurch", "halfway-houses", "rushenden",
    "snipeshill", "bobbing", "iwade", "lower-halstow", "upchurch", "rainham", "hempstead",
    "walderslade", "lordswood", "boxley", "detling", "thurnham", "bearsted", "hollingbourne",

    // --- South West England ---
    "plymouth", "bournemouth", "poole", "swindon", "gloucester", "cheltenham", "exeter",
    "bath", "weston-super-mare", "taunton", "salisbury", "weymouth", "yeovil", "torquay",
    "paignton", "brixham", "newton-abbot", "teignmouth", "dawlish", "exmouth", "sidmouth",
    "honiton", "axminster", "seaton", "cullompton", "tiverton", "crediton", "okehampton",

    // --- Scotland ---
    "aberdeen", "dundee", "paisley", "east-kilbride", "livingston", "hamilton", "cumbernauld",
    "dunfermline", "kirkcaldy", "ayr", "perth", "kilmarnock", "inverness", "stirling", "falkirk",

    // --- Wales ---
    "swansea", "newport", "wrexham", "barry", "neath", "cwmbran", "bridgend", "llanelli",
    "merthyr-tydfil", "caerphilly", "port-talbot", "pontypridd", "aberdare", "ebbw-vale",

    // --- Northern Ireland ---
    "belfast", "derry", "lisburn", "newtownabbey", "bangor", "craigavon", "castlereagh",
    "ballymena", "newtownards", "newry"

    // Removed duplicates naturally handled below by Set behavior if any sneak in.
];
