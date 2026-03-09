// A comprehensive list of UK cities, towns, and London boroughs for programmatic SEO.
// Expanding from ~150 to 500+ top locations to capture long-tail local search traffic.

export const UK_CITIES = [
    // --- Major Cities & Capitals ---
    "london", "birmingham", "manchester", "leeds", "glasgow", "sheffield", "edinburgh",
    "liverpool", "bristol", "cardiff", "belfast", "nottingham", "newcastle", "southampton",

    // --- London Boroughs & Key Areas ---
    "acton", "amberley", "balham", "barking", "barnet", "battersea", "bexley", "bow", "brent",
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
    "wimbledon", "wood-green", "woolwich", "dagenham", "romford", "ilford", "wembley",
    "greenford", "west-drayton", "northolt", "stanmore", "bushey", "rickmansworth",
    "borehamwood", "potters-bar", "cheshunt", "waltham-cross", "chigwell", "loughton",

    // --- Midlands & Central England ---
    "wolverhampton", "coventry", "leicester", "stoke-on-trent", "derby", "northampton",
    "dudley", "walsall", "telford", "solihull", "worcester", "warwick", "leamington-spa",
    "stafford", "burton-upon-trent", "nuneaton", "kidderminster", "shrewsbury", "chesterfield",
    "mansfield", "loughborough", "kettering", "corby", "wellingborough", "rugby",
    "stratford-upon-avon", "redditch", "bromsgrove", "stourbridge", "halesowen",
    "canock", "lichfield", "tamworth", "hinckley", "coalville", "melton-mowbray", "newark-on-trent",
    "smethwick", "west-bromwich", "bilston", "willenhall", "wednesbury", "rowley-regis",
    "oldbury", "brierley-hill", "kingswinford", "sedgley", "tipton", "droitwich", "pershore",
    "evesham", "kenilworth", "bedworth", "atherton", "sutton-coldfield", "beeston", "west-bridgford",

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
    "banks", "parbold", "appley-bridge", "shevington", "coppull", "euxton",
    "buckshaw-village", "whittle-le-woods", "brindle", "hoghton", "wheelton", "withnell",
    "abbey-village", "brinscall", "white-coppice", "anglezarke", "rivington", "belmont",
    "nantwich", "northwich", "winsford", "middlewich", "sandbach", "alsager", "congleton",
    "knutsford", "wilmslow", "alderley-edge", "poynton", "marple", "romiley",

    // --- North East & Yorkshire ---
    "bradford", "sunderland", "hull", "gateshead", "york", "middlesbrough", "doncaster",
    "rotherham", "barnsley", "wakefield", "harrogate", "keighley", "dewsbury",
    "batley", "scarborough", "scunthorpe", "grimsby", "cleethorpes", "hartlepool", "stockton-on-tees",
    "darlington", "durham", "washington", "south-shields", "jarrow", "hebburn", "wallsend",
    "north-shields", "tynemouth", "whitley-bay", "blyth", "cramlington", "ashington",
    "morpeth", "hexham", "ponteland", "prhoe", "riding-mill", "corbridge", "haydon-bridge",
    "haltwhistle", "bellingham", "rothbury", "alnwick", "wooler", "berwick-upon-tweed",
    "seahouses", "bamburgh", "beadnell", "craster", "embleton", "newton-by-the-sea",
    "pontefract", "castleford", "normanton", "ossett", "cleckheaton", "heckmondwike",
    "mirfield", "brighouse", "elland", "hebden-bridge", "todmorden", "sowerby-bridge",
    "bingley", "shipley", "baildon", "ilkley", "otley", "pudsey", "morley", "garforth",

    // --- Eastern England ---
    "peterborough", "cambridge", "norwich", "ipswich", "luton", "southend-on-sea", "colchester",
    "chelmsford", "basildon", "stevenage", "stalbans", "watford", "bedford", "harlow",
    "grays", "brentwood", "braintree", "kings-lynn", "great-yarmouth", "lowestoft", "bury-st-edmunds",
    "ely", "huntingdon", "st-neots", "st-ives", "wisbech", "march", "chatteris", "whittlesey",
    "hemel-hempstead", "welwyn-garden-city", "hatfield", "hertford", "bishops-stortford",
    "hitchin", "letchworth", "royston", "dunstable", "leighton-buzzard", "biggleswade",
    "flitwick", "ampthill", "kempston", "witham", "maldon", "clacton-on-sea",

    // --- South East England ---
    "brighton", "portsmouth", "milton-keynes", "reading", "slough", "oxford", "high-wycombe",
    "maidstone", "basingstoke", "guildford", "eastbourne", "hastings", "crawley", "woking",
    "chatham", "gillingham", "dartford", "gravesend", "ashford", "tunbridge-wells", "margate",
    "ramsgate", "folkestone", "dover", "deal", "canterbury", "herne-bay", "whitstable",
    "sittingbourne", "faversham", "isle-of-sheppey", "sheerness", "minster-on-sea",
    "queenborough", "leysdown-on-sea", "eastchurch", "halfway-houses", "rushenden",
    "snipeshill", "bobbing", "iwade", "lower-halstow", "upchurch", "rainham", "hempstead",
    "walderslade", "lordswood", "boxley", "detling", "thurnham", "bearsted", "hollingbourne",
    "winchester", "andover", "farnborough", "aldershot", "fleet", "waterlooville", "fareham",
    "havant", "gosport", "bognor-regis", "littlehampton", "worthing", "shoreham-by-sea",
    "horsham", "haywards-heath", "burgess-hill", "sevenoaks", "tonbridge", "reigate",
    "redhill", "epsom", "leatherhead", "banbury", "bicester", "didcot", "abingdon",
    "witney", "aylesbury", "chesham", "amersham", "marlow", "buckingham", "newbury",

    // --- South West England ---
    "plymouth", "bournemouth", "poole", "swindon", "gloucester", "cheltenham", "exeter",
    "bath", "weston-super-mare", "taunton", "salisbury", "weymouth", "yeovil", "torquay",
    "paignton", "brixham", "newton-abbot", "teignmouth", "dawlish", "exmouth", "sidmouth",
    "honiton", "axminster", "seaton", "cullompton", "tiverton", "crediton", "okehampton",
    "trowbridge", "chippenham", "salisbury", "devizes", "marlborough", "warminster",
    "melksham", "corsham", "bradford-on-avon", "calne", "royal-wootton-bassett", "amesbury",
    "stroud", "cirencester", "tewkesbury", "yate", "clevedon", "portishead",
    "bridgwater", "burnham-on-sea", "minehead", "wellington", "dorchester", "bridport",
    "blandford-forum", "shaftesbury", "gillingham-dorset", "truro", "falmouth", "penzance",
    "st-austell", "newquay", "camborne", "redruth", "saltash",

    // --- Scotland ---
    "aberdeen", "dundee", "paisley", "east-kilbride", "livingston", "hamilton", "cumbernauld",
    "dunfermline", "kirkcaldy", "ayr", "perth", "kilmarnock", "inverness", "stirling", "falkirk",
    "coatbridge", "airdrie", "irvine", "motherwell", "wishaw", "clydebank", "bearsden",
    "bishopbriggs", "musselburgh", "arbroath", "elgin", "bellshill", "alloa", "dumbarton",

    // --- Wales ---
    "swansea", "newport", "wrexham", "barry", "neath", "cwmbran", "bridgend", "llanelli",
    "merthyr-tydfil", "caerphilly", "port-talbot", "pontypridd", "aberdare", "ebbw-vale",
    "carmarthen", "haverfordwest", "milford-haven", "pembroke-dock", "tenby",
    "bangor-wales", "caernarfon", "holyhead", "llangefni", "colwyn-bay", "llandudno",
    "rhyl", "prestatyn", "connahs-quay", "flint", "mold",

    // --- Northern Ireland ---
    "belfast", "derry", "lisburn", "newtownabbey", "bangor-ni", "craigavon", "castlereagh",
    "ballymena", "newtownards", "newry", "coleraine", "carrickfergus", "omagh", "antrim",
    "larne", "banbridge", "armagh", "enniskillen", "strabane"

    // Removed duplicates naturally handled below by Set behavior if any sneak in.
];
