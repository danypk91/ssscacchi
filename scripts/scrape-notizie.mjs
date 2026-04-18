import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const LINKS = [
  { id: 480, slug: "trofeo-scacchi-scuola-provinciale-2026", url: "https://santasabina.altervista.org/index.php/notizie/480-trofeo-scacchi-scuola-provinciale-2026" },
  { id: 479, slug: "4-trofeo-juniores-di-scacchi-citta-di-genova-tappa-7", url: "https://santasabina.altervista.org/index.php/notizie/479-4-trofeo-juniores-di-scacchi-citta-di-genova-tappa-7" },
  { id: 477, slug: "torneo-sociale-di-primavera-2026-start", url: "https://santasabina.altervista.org/index.php/notizie/477-torneo-sociale-di-primavera-2026-start" },
  { id: 463, slug: "torneo-sociale-grand-prix-lampo-2026-3-tappa", url: "https://santasabina.altervista.org/index.php/notizie/463-torneo-sociale-grand-prix-lampo-2026-3-tappa" },
  { id: 478, slug: "torneo-sociale-di-primavera-2026-3", url: "https://santasabina.altervista.org/index.php/notizie/478-torneo-sociale-di-primavera-2026-3" },
  { id: 476, slug: "torneo-sociale-grand-prix-lampo-2026-02-end", url: "https://santasabina.altervista.org/index.php/notizie/476-torneo-sociale-grand-prix-lampo-2026-02-end" },
  { id: 475, slug: "torneo-sociale-grand-prix-lampo-2026-1-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/475-torneo-sociale-grand-prix-lampo-2026-1-tappa-end" },
  { id: 474, slug: "torneo-sociale-grand-prix-lampo-2026", url: "https://santasabina.altervista.org/index.php/notizie/474-torneo-sociale-grand-prix-lampo-2026" },
  { id: 473, slug: "1-memorial-massimo-saffioti", url: "https://santasabina.altervista.org/index.php/notizie/473-1-memorial-massimo-saffioti" },
  { id: 472, slug: "4-trofeo-juniores-di-scacchi-citta-di-genova-quarta-tappa", url: "https://santasabina.altervista.org/index.php/notizie/472-4-trofeo-juniores-di-scacchi-citta-di-genova-quarta-tappa" },
  { id: 471, slug: "torneo-sociale-rapid-natale-2025-end", url: "https://santasabina.altervista.org/index.php/notizie/471-torneo-sociale-rapid-natale-2025-end" },
  { id: 470, slug: "chiusura-feste-natalizie-del-circolo-scacchistico", url: "https://santasabina.altervista.org/index.php/notizie/470-chiusura-feste-natalizie-del-circolo-scacchistico" },
  { id: 469, slug: "le-regine-degli-scacchi-2", url: "https://santasabina.altervista.org/index.php/notizie/469-le-regine-degli-scacchi-2" },
  { id: 468, slug: "concluso-il-torneo-sociale-grand-prix-lampo-2025", url: "https://santasabina.altervista.org/index.php/notizie/468-concluso-il-torneo-sociale-grand-prix-lampo-2025" },
  { id: 467, slug: "iscrizione-e-quote-2026", url: "https://santasabina.altervista.org/index.php/notizie/467-iscrizione-e-quote-2026" },
  { id: 464, slug: "torneo-sociale-rapid-natale-2025", url: "https://santasabina.altervista.org/index.php/notizie/464-torneo-sociale-rapid-natale-2025" },
  { id: 466, slug: "le-regine-degli-scacchi", url: "https://santasabina.altervista.org/index.php/notizie/466-le-regine-degli-scacchi" },
  { id: 462, slug: "scacco-al-drago-presso-palazzo-reale", url: "https://santasabina.altervista.org/index.php/notizie/462-scacco-al-drago-presso-palazzo-reale" },
  { id: 460, slug: "torneo-sociale-di-autunno-2025-end", url: "https://santasabina.altervista.org/index.php/notizie/460-torneo-sociale-di-autunno-2025-end" },
  { id: 459, slug: "torneo-sociale-grand-prix-lampo-2025-9-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/459-torneo-sociale-grand-prix-lampo-2025-9-tappa-end" },
  { id: 458, slug: "torneo-sociale-grand-prix-lampo-2025-9-tappa", url: "https://santasabina.altervista.org/index.php/notizie/458-torneo-sociale-grand-prix-lampo-2025-9-tappa" },
  { id: 457, slug: "xxiii-weekend-valbisagno-end", url: "https://santasabina.altervista.org/index.php/notizie/457-xxiii-weekend-valbisagno-end" },
  { id: 456, slug: "trofeo-coni-nazionale-2025", url: "https://santasabina.altervista.org/index.php/notizie/456-trofeo-coni-nazionale-2025" },
  { id: 454, slug: "torneo-sociale-grand-prix-lampo-2025-8-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/454-torneo-sociale-grand-prix-lampo-2025-8-tappa-end" },
  { id: 453, slug: "torneo-sociale-di-autunno-2025-go", url: "https://santasabina.altervista.org/index.php/notizie/453-torneo-sociale-di-autunno-2025-go" },
  { id: 450, slug: "torneo-sociale-di-autunno-2025-start", url: "https://santasabina.altervista.org/index.php/notizie/450-torneo-sociale-di-autunno-2025-start" },
  { id: 452, slug: "xxiii-weekend-valbisagno", url: "https://santasabina.altervista.org/index.php/notizie/452-xxiii-weekend-valbisagno" },
  { id: 448, slug: "torneo-sociale-grand-prix-lampo-2025-7-tappa", url: "https://santasabina.altervista.org/index.php/notizie/448-torneo-sociale-grand-prix-lampo-2025-7-tappa" },
  { id: 449, slug: "torneo-sociale-grand-prix-lampo-2025-7-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/449-torneo-sociale-grand-prix-lampo-2025-7-tappa-end" },
  { id: 447, slug: "scacchi-al-mercato-e-non-solo", url: "https://santasabina.altervista.org/index.php/notizie/447-scacchi-al-mercato-e-non-solo" },
  { id: 445, slug: "chiusura-estiva-circolo-2025-ec", url: "https://santasabina.altervista.org/index.php/notizie/445-chiusura-estiva-circolo-2025-ec" },
  { id: 446, slug: "scacchi-al-mercato-estate-2025", url: "https://santasabina.altervista.org/index.php/notizie/446-scacchi-al-mercato-estate-2025" },
  { id: 444, slug: "torneo-sociale-grand-prix-lampo-2025-6-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/444-torneo-sociale-grand-prix-lampo-2025-6-tappa-end" },
  { id: 443, slug: "chiusura-estiva-circolo-2025", url: "https://santasabina.altervista.org/index.php/notizie/443-chiusura-estiva-circolo-2025" },
  { id: 442, slug: "trofeo-coni-liguria-2025-end", url: "https://santasabina.altervista.org/index.php/notizie/442-trofeo-coni-liguria-2025-end" },
  { id: 440, slug: "torneo-sociale-di-primavera-2025-end", url: "https://santasabina.altervista.org/index.php/notizie/440-torneo-sociale-di-primavera-2025-end" },
  { id: 441, slug: "trofeo-coni-liguria-2025", url: "https://santasabina.altervista.org/index.php/notizie/441-trofeo-coni-liguria-2025" },
  { id: 439, slug: "torneo-sociale-grand-prix-lampo-2025-5", url: "https://santasabina.altervista.org/index.php/notizie/439-torneo-sociale-grand-prix-lampo-2025-5" },
  { id: 437, slug: "campionato-regionale-under-18", url: "https://santasabina.altervista.org/index.php/notizie/437-campionato-regionale-under-18" },
  { id: 436, slug: "torneo-sociale-grand-prix-lampo-2025-4-end", url: "https://santasabina.altervista.org/index.php/notizie/436-torneo-sociale-grand-prix-lampo-2025-4-end" },
  { id: 438, slug: "torneo-sociale-di-primavera-2025", url: "https://santasabina.altervista.org/index.php/notizie/438-torneo-sociale-di-primavera-2025" },
  { id: 435, slug: "torneo-sociale-grand-prix-lampo-2025-4", url: "https://santasabina.altervista.org/index.php/notizie/435-torneo-sociale-grand-prix-lampo-2025-4" },
  { id: 434, slug: "torneo-sociale-di-primavera-2025-start", url: "https://santasabina.altervista.org/index.php/notizie/434-torneo-sociale-di-primavera-2025-start" },
  { id: 432, slug: "campionato-provinciale-di-genova-2025-1", url: "https://santasabina.altervista.org/index.php/notizie/432-campionato-provinciale-di-genova-2025-1" },
  { id: 433, slug: "trofeo-scacchi-scuola-liguria-2025", url: "https://santasabina.altervista.org/index.php/notizie/433-trofeo-scacchi-scuola-liguria-2025" },
  { id: 430, slug: "torneo-sociale-grand-prix-lampo-2025-3", url: "https://santasabina.altervista.org/index.php/notizie/430-torneo-sociale-grand-prix-lampo-2025-3" },
  { id: 431, slug: "torneo-sociale-grand-prix-lampo-2025-3-end", url: "https://santasabina.altervista.org/index.php/notizie/431-torneo-sociale-grand-prix-lampo-2025-3-end" },
  { id: 429, slug: "campionato-provinciale-di-genova-2025", url: "https://santasabina.altervista.org/index.php/notizie/429-campionato-provinciale-di-genova-2025" },
  { id: 428, slug: "campionato-italiano-a-squadre-cis-2025", url: "https://santasabina.altervista.org/index.php/notizie/428-campionato-italiano-a-squadre-cis-2025" },
  { id: 427, slug: "3-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa", url: "https://santasabina.altervista.org/index.php/notizie/427-3-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa" },
  { id: 425, slug: "torneo-sociale-grand-prix-lampo-2025-02", url: "https://santasabina.altervista.org/index.php/notizie/425-torneo-sociale-grand-prix-lampo-2025-02" },
  { id: 424, slug: "torneo-sociale-grand-prix-lampo-2025-01-end", url: "https://santasabina.altervista.org/index.php/notizie/424-torneo-sociale-grand-prix-lampo-2025-01-end" },
  { id: 426, slug: "torneo-sociale-grand-prix-lampo-2025-02-end", url: "https://santasabina.altervista.org/index.php/notizie/426-torneo-sociale-grand-prix-lampo-2025-02-end" },
  { id: 423, slug: "torneo-sociale-grand-prix-lampo-2025", url: "https://santasabina.altervista.org/index.php/notizie/423-torneo-sociale-grand-prix-lampo-2025" },
  { id: 420, slug: "corso-con-il-mf-raffaele-di-paolo-rettifica-date", url: "https://santasabina.altervista.org/index.php/notizie/420-corso-con-il-mf-raffaele-di-paolo-rettifica-date" },
  { id: 419, slug: "corso-con-il-mf-raffaele-di-paolo", url: "https://santasabina.altervista.org/index.php/notizie/419-corso-con-il-mf-raffaele-di-paolo" },
  { id: 418, slug: "torneo-sociale-rapid-natale-2024-end", url: "https://santasabina.altervista.org/index.php/notizie/418-torneo-sociale-rapid-natale-2024-end" },
  { id: 417, slug: "chiusura-circolo-natale-2024", url: "https://santasabina.altervista.org/index.php/notizie/417-chiusura-circolo-natale-2024" },
  { id: 416, slug: "torneo-sociale-grand-prix-lampo-2024-10-end", url: "https://santasabina.altervista.org/index.php/notizie/416-torneo-sociale-grand-prix-lampo-2024-10-end" },
  { id: 415, slug: "iscrizione-e-quote-2025", url: "https://santasabina.altervista.org/index.php/notizie/415-iscrizione-e-quote-2025" },
  { id: 414, slug: "torneo-sociale-rapid-natale-2024", url: "https://santasabina.altervista.org/index.php/notizie/414-torneo-sociale-rapid-natale-2024" },
  { id: 413, slug: "torneo-sociale-grand-prix-lampo-2024-10", url: "https://santasabina.altervista.org/index.php/notizie/413-torneo-sociale-grand-prix-lampo-2024-10" },
  { id: 411, slug: "xxii-weekend-valbisagno-2", url: "https://santasabina.altervista.org/index.php/notizie/411-xxii-weekend-valbisagno-2" },
  { id: 410, slug: "assemblea-annuale-dei-soci-2024", url: "https://santasabina.altervista.org/index.php/notizie/410-assemblea-annuale-dei-soci-2024" },
  { id: 409, slug: "torneo-sociale-grand-prix-lampo-2024-09-end", url: "https://santasabina.altervista.org/index.php/notizie/409-torneo-sociale-grand-prix-lampo-2024-09-end" },
  { id: 408, slug: "torneo-sociale-grand-prix-lampo-2024-09", url: "https://santasabina.altervista.org/index.php/notizie/408-torneo-sociale-grand-prix-lampo-2024-09" },
  { id: 407, slug: "xxii-weekend-valbisagno", url: "https://santasabina.altervista.org/index.php/notizie/407-xxii-weekend-valbisagno" },
  { id: 406, slug: "torneo-sociale-grand-prix-lampo-2024-08-end", url: "https://santasabina.altervista.org/index.php/notizie/406-torneo-sociale-grand-prix-lampo-2024-08-end" },
  { id: 405, slug: "festa-dei-nonni-con-gli-scacchi", url: "https://santasabina.altervista.org/index.php/notizie/405-festa-dei-nonni-con-gli-scacchi" },
  { id: 404, slug: "torneo-sociale-di-autunno-2024-start", url: "https://santasabina.altervista.org/index.php/notizie/404-torneo-sociale-di-autunno-2024-start" },
  { id: 412, slug: "torneo-sociale-di-autunno-2024-end", url: "https://santasabina.altervista.org/index.php/notizie/412-torneo-sociale-di-autunno-2024-end" },
  { id: 403, slug: "torneo-sociale-grand-prix-lampo-2024-07-end", url: "https://santasabina.altervista.org/index.php/notizie/403-torneo-sociale-grand-prix-lampo-2024-07-end" },
  { id: 402, slug: "finita-l-estate-il-circolo-riapre", url: "https://santasabina.altervista.org/index.php/notizie/402-finita-l-estate-il-circolo-riapre" },
  { id: 401, slug: "scacchi-d-estate-2", url: "https://santasabina.altervista.org/index.php/notizie/401-scacchi-d-estate-2" },
  { id: 400, slug: "scacchi-d-estate-1", url: "https://santasabina.altervista.org/index.php/notizie/400-scacchi-d-estate-1" },
  { id: 399, slug: "chiusura-circolo-estate-2024-1", url: "https://santasabina.altervista.org/index.php/notizie/399-chiusura-circolo-estate-2024-1" },
  { id: 397, slug: "chiusura-circolo-estate-2024", url: "https://santasabina.altervista.org/index.php/notizie/397-chiusura-circolo-estate-2024" },
  { id: 396, slug: "scacchi-d-estate", url: "https://santasabina.altervista.org/index.php/notizie/396-scacchi-d-estate" },
  { id: 387, slug: "torneo-sociale-grand-prix-lampo-2024-05-end", url: "https://santasabina.altervista.org/index.php/notizie/387-torneo-sociale-grand-prix-lampo-2024-05-end" },
  { id: 395, slug: "torneo-sociale-grand-prix-lampo-2024-06-end", url: "https://santasabina.altervista.org/index.php/notizie/395-torneo-sociale-grand-prix-lampo-2024-06-end" },
  { id: 394, slug: "torneo-sociale-grand-prix-lampo-2024-t5", url: "https://santasabina.altervista.org/index.php/notizie/394-torneo-sociale-grand-prix-lampo-2024-t5" },
  { id: 393, slug: "torneo-sociale-di-primavera-2024-end", url: "https://santasabina.altervista.org/index.php/notizie/393-torneo-sociale-di-primavera-2024-end" },
  { id: 392, slug: "torneo-sociale-di-primavera-2024-6", url: "https://santasabina.altervista.org/index.php/notizie/392-torneo-sociale-di-primavera-2024-6" },
  { id: 390, slug: "torneo-sociale-di-primavera-2024-04", url: "https://santasabina.altervista.org/index.php/notizie/390-torneo-sociale-di-primavera-2024-04" },
  { id: 391, slug: "torneo-sociale-di-primavera-2024-05", url: "https://santasabina.altervista.org/index.php/notizie/391-torneo-sociale-di-primavera-2024-05" },
  { id: 386, slug: "torneo-sociale-grand-prix-lampo-2024-t4", url: "https://santasabina.altervista.org/index.php/notizie/386-torneo-sociale-grand-prix-lampo-2024-t4" },
  { id: 384, slug: "torneo-sociale-di-primavera-2024-3", url: "https://santasabina.altervista.org/index.php/notizie/384-torneo-sociale-di-primavera-2024-3" },
  { id: 383, slug: "torneo-sociale-di-primavera-2024-01", url: "https://santasabina.altervista.org/index.php/notizie/383-torneo-sociale-di-primavera-2024-01" },
  { id: 348, slug: "2-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa", url: "https://santasabina.altervista.org/index.php/notizie/348-2-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa" },
  { id: 380, slug: "torneo-sociale-di-primavera-2024-start", url: "https://santasabina.altervista.org/index.php/notizie/380-torneo-sociale-di-primavera-2024-start" },
  { id: 378, slug: "torneo-sociale-grand-prix-lampo-2024-02-end", url: "https://santasabina.altervista.org/index.php/notizie/378-torneo-sociale-grand-prix-lampo-2024-02-end" },
  { id: 382, slug: "torneo-sociale-grand-prix-lampo-2024-03-end", url: "https://santasabina.altervista.org/index.php/notizie/382-torneo-sociale-grand-prix-lampo-2024-03-end" },
  { id: 377, slug: "torneo-sociale-grand-prix-lampo-2024-t2", url: "https://santasabina.altervista.org/index.php/notizie/377-torneo-sociale-grand-prix-lampo-2024-t2" },
  { id: 381, slug: "torneo-sociale-grand-prix-lampo-2024-t3", url: "https://santasabina.altervista.org/index.php/notizie/381-torneo-sociale-grand-prix-lampo-2024-t3" },
  { id: 376, slug: "preti-sacchi-e-vino", url: "https://santasabina.altervista.org/index.php/notizie/376-preti-sacchi-e-vino" },
  { id: 375, slug: "torneo-sociale-grand-prix-lampo-2024-01-end", url: "https://santasabina.altervista.org/index.php/notizie/375-torneo-sociale-grand-prix-lampo-2024-01-end" },
  { id: 374, slug: "torneo-sociale-grand-prix-lampo-2024", url: "https://santasabina.altervista.org/index.php/notizie/374-torneo-sociale-grand-prix-lampo-2024" },
  { id: 373, slug: "scacchi-per-ragazzini", url: "https://santasabina.altervista.org/index.php/notizie/373-scacchi-per-ragazzini" },
  { id: 372, slug: "torneo-sociale-rapid-natale-2023", url: "https://santasabina.altervista.org/index.php/notizie/372-torneo-sociale-rapid-natale-2023" },
  { id: 370, slug: "torneo-sociale-grand-prix-2024", url: "https://santasabina.altervista.org/index.php/notizie/370-torneo-sociale-grand-prix-2024" },
  { id: 369, slug: "iscrizione-e-quote-2024", url: "https://santasabina.altervista.org/index.php/notizie/369-iscrizione-e-quote-2024" },
  { id: 368, slug: "10-tappa-torneo-sociale-grand-prix-2023", url: "https://santasabina.altervista.org/index.php/notizie/368-10-tappa-torneo-sociale-grand-prix-2023" },
  { id: 367, slug: "torneo-sociale-di-autunno-2023-end", url: "https://santasabina.altervista.org/index.php/notizie/367-torneo-sociale-di-autunno-2023-end" },
  { id: 366, slug: "assemblea-annuale-soci-2023-1", url: "https://santasabina.altervista.org/index.php/notizie/366-assemblea-annuale-soci-2023-1" },
  { id: 365, slug: "scacchi-per-bambini", url: "https://santasabina.altervista.org/index.php/notizie/365-scacchi-per-bambini" },
  { id: 364, slug: "9-tappa-torneo-sociale-grand-prix-2023-end-t9", url: "https://santasabina.altervista.org/index.php/notizie/364-9-tappa-torneo-sociale-grand-prix-2023-end-t9" },
  { id: 363, slug: "9-tappa-torneo-sociale-grand-prix-2023-1", url: "https://santasabina.altervista.org/index.php/notizie/363-9-tappa-torneo-sociale-grand-prix-2023-1" },
  { id: 361, slug: "xxi-weekend-valbisagno", url: "https://santasabina.altervista.org/index.php/notizie/361-xxi-weekend-valbisagno" },
  { id: 360, slug: "torneo-sociale-grand-prix-2023-end-t8", url: "https://santasabina.altervista.org/index.php/notizie/360-torneo-sociale-grand-prix-2023-end-t8" },
  { id: 359, slug: "8-tappa-torneo-sociale-grand-prix-2023", url: "https://santasabina.altervista.org/index.php/notizie/359-8-tappa-torneo-sociale-grand-prix-2023" },
  { id: 358, slug: "torneo-sociale-di-autunno-2023-prog", url: "https://santasabina.altervista.org/index.php/notizie/358-torneo-sociale-di-autunno-2023-prog" },
  { id: 357, slug: "torneo-di-scacchi-under-14", url: "https://santasabina.altervista.org/index.php/notizie/357-torneo-di-scacchi-under-14" },
  { id: 356, slug: "torneo-sociale-di-autunno-2023-start", url: "https://santasabina.altervista.org/index.php/notizie/356-torneo-sociale-di-autunno-2023-start" },
  { id: 352, slug: "torneo-sociale-grand-prix-2023-end-t7", url: "https://santasabina.altervista.org/index.php/notizie/352-torneo-sociale-grand-prix-2023-end-t7" },
  { id: 355, slug: "7-tappa-torneo-sociale-grand-prix-2023-2", url: "https://santasabina.altervista.org/index.php/notizie/355-7-tappa-torneo-sociale-grand-prix-2023-2" },
  { id: 354, slug: "riapertura-circolo-2023", url: "https://santasabina.altervista.org/index.php/notizie/354-riapertura-circolo-2023" },
  { id: 353, slug: "chiusura-circolo-estate-2023", url: "https://santasabina.altervista.org/index.php/notizie/353-chiusura-circolo-estate-2023" },
  { id: 351, slug: "torneo-sociale-grand-prix-2023-go-t6", url: "https://santasabina.altervista.org/index.php/notizie/351-torneo-sociale-grand-prix-2023-go-t6" },
  { id: 347, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-ottava-tappa", url: "https://santasabina.altervista.org/index.php/notizie/347-1-trofeo-juniores-di-scacchi-citta-di-genova-ottava-tappa" },
  { id: 346, slug: "trofeo-scacchi-scuola-2023", url: "https://santasabina.altervista.org/index.php/notizie/346-trofeo-scacchi-scuola-2023" },
  { id: 345, slug: "torneo-sociale-grand-prix-2023-go-t3-end", url: "https://santasabina.altervista.org/index.php/notizie/345-torneo-sociale-grand-prix-2023-go-t3-end" },
  { id: 350, slug: "torneo-sociale-grand-prix-2023-go-t5d-2", url: "https://santasabina.altervista.org/index.php/notizie/350-torneo-sociale-grand-prix-2023-go-t5d-2" },
  { id: 344, slug: "torneo-sociale-grand-prix-2023-go-t3", url: "https://santasabina.altervista.org/index.php/notizie/344-torneo-sociale-grand-prix-2023-go-t3" },
  { id: 343, slug: "torneo-sociale-primavera-2023-go", url: "https://santasabina.altervista.org/index.php/notizie/343-torneo-sociale-primavera-2023-go" },
  { id: 349, slug: "torneo-sociale-primavera-2023-end", url: "https://santasabina.altervista.org/index.php/notizie/349-torneo-sociale-primavera-2023-end" },
  { id: 341, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa-end", url: "https://santasabina.altervista.org/index.php/notizie/341-1-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa-end" },
  { id: 340, slug: "torneo-sociale-primavera-2023", url: "https://santasabina.altervista.org/index.php/notizie/340-torneo-sociale-primavera-2023" },
  { id: 339, slug: "campionato-provinciale-2023", url: "https://santasabina.altervista.org/index.php/notizie/339-campionato-provinciale-2023" },
  { id: 336, slug: "circolo-nuovamente-aperto-al-venerdi", url: "https://santasabina.altervista.org/index.php/notizie/336-circolo-nuovamente-aperto-al-venerdi" },
  { id: 337, slug: "torneo-sociale-grand-prix-2023-go-t2-end", url: "https://santasabina.altervista.org/index.php/notizie/337-torneo-sociale-grand-prix-2023-go-t2-end" },
  { id: 338, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa", url: "https://santasabina.altervista.org/index.php/notizie/338-1-trofeo-juniores-di-scacchi-citta-di-genova-settima-tappa" },
  { id: 334, slug: "torneo-sociale-grand-prix-2023-go-t2", url: "https://santasabina.altervista.org/index.php/notizie/334-torneo-sociale-grand-prix-2023-go-t2" },
  { id: 330, slug: "torneo-sociale-grand-prix-2023-go", url: "https://santasabina.altervista.org/index.php/notizie/330-torneo-sociale-grand-prix-2023-go" },
  { id: 329, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-quinta-tappa", url: "https://santasabina.altervista.org/index.php/notizie/329-1-trofeo-juniores-di-scacchi-citta-di-genova-quinta-tappa" },
  { id: 335, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-sesta-tappa", url: "https://santasabina.altervista.org/index.php/notizie/335-1-trofeo-juniores-di-scacchi-citta-di-genova-sesta-tappa" },
  { id: 275, slug: "torneo-sociale-grand-prix-2023", url: "https://santasabina.altervista.org/index.php/notizie/275-torneo-sociale-grand-prix-2023" },
  { id: 328, slug: "torneo-sociale-di-autunno-2022-end", url: "https://santasabina.altervista.org/index.php/notizie/328-torneo-sociale-di-autunno-2022-end" },
  { id: 326, slug: "torneo-sociale-rapid-natale-2022", url: "https://santasabina.altervista.org/index.php/notizie/326-torneo-sociale-rapid-natale-2022" },
  { id: 325, slug: "iscrizione-e-quote-2023-01", url: "https://santasabina.altervista.org/index.php/notizie/325-iscrizione-e-quote-2023-01" },
  { id: 226, slug: "assemblea-annuale-soci-2018", url: "https://santasabina.altervista.org/index.php/notizie/226-assemblea-annuale-soci-2018" },
  { id: 327, slug: "assemblea-annuale-soci-2022", url: "https://santasabina.altervista.org/index.php/notizie/327-assemblea-annuale-soci-2022" },
  { id: 324, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-terza-tappa", url: "https://santasabina.altervista.org/index.php/notizie/324-1-trofeo-juniores-di-scacchi-citta-di-genova-terza-tappa" },
  { id: 321, slug: "torneo-sociale-di-autunno-2022-start", url: "https://santasabina.altervista.org/index.php/notizie/321-torneo-sociale-di-autunno-2022-start" },
  { id: 318, slug: "chiusura-circolo-20220916", url: "https://santasabina.altervista.org/index.php/notizie/318-chiusura-circolo-20220916" },
  { id: 316, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova", url: "https://santasabina.altervista.org/index.php/notizie/316-1-trofeo-juniores-di-scacchi-citta-di-genova" },
  { id: 319, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-seconda-tappa", url: "https://santasabina.altervista.org/index.php/notizie/319-1-trofeo-juniores-di-scacchi-citta-di-genova-seconda-tappa" },
  { id: 322, slug: "1-trofeo-juniores-di-scacchi-citta-di-genova-seconda-tappa-2-end", url: "https://santasabina.altervista.org/index.php/notizie/322-1-trofeo-juniores-di-scacchi-citta-di-genova-seconda-tappa-2-end" },
  { id: 315, slug: "riapertura-del-circolo-scacchistico", url: "https://santasabina.altervista.org/index.php/notizie/315-riapertura-del-circolo-scacchistico" },
  { id: 314, slug: "chiusura-circolo-estate-2022", url: "https://santasabina.altervista.org/index.php/notizie/314-chiusura-circolo-estate-2022" },
  { id: 313, slug: "lampo-20220628", url: "https://santasabina.altervista.org/index.php/notizie/313-lampo-20220628" },
  { id: 312, slug: "lampo-05-2022-end", url: "https://santasabina.altervista.org/index.php/notizie/312-lampo-05-2022-end" },
  { id: 311, slug: "torneo-propaganda-under-12", url: "https://santasabina.altervista.org/index.php/notizie/311-torneo-propaganda-under-12" },
  { id: 310, slug: "lampo-05-2022", url: "https://santasabina.altervista.org/index.php/notizie/310-lampo-05-2022" },
  { id: 308, slug: "xviii-memorial-sigona-under-12-end", url: "https://santasabina.altervista.org/index.php/notizie/308-xviii-memorial-sigona-under-12-end" },
  { id: 307, slug: "xviii-memorial-sigona-under-12", url: "https://santasabina.altervista.org/index.php/notizie/307-xviii-memorial-sigona-under-12" },
  { id: 306, slug: "in-memoria-di-massimo", url: "https://santasabina.altervista.org/index.php/notizie/306-in-memoria-di-massimo" },
  { id: 305, slug: "lutto-3", url: "https://santasabina.altervista.org/index.php/notizie/305-lutto-3" },
  { id: 303, slug: "chiusura-circolo-pasqua-2022", url: "https://santasabina.altervista.org/index.php/notizie/303-chiusura-circolo-pasqua-2022" },
  { id: 301, slug: "torneo-sociale-primavera-2022", url: "https://santasabina.altervista.org/index.php/notizie/301-torneo-sociale-primavera-2022" },
  { id: 309, slug: "torneo-sociale-primavera-2022-end", url: "https://santasabina.altervista.org/index.php/notizie/309-torneo-sociale-primavera-2022-end" },
  { id: 300, slug: "iscrizione-e-quote-2022-01", url: "https://santasabina.altervista.org/index.php/notizie/300-iscrizione-e-quote-2022-01" },
  { id: 299, slug: "torneo-sociale-autunno-2021-end", url: "https://santasabina.altervista.org/index.php/notizie/299-torneo-sociale-autunno-2021-end" },
  { id: 298, slug: "iscrizione-e-quote-2022", url: "https://santasabina.altervista.org/index.php/notizie/298-iscrizione-e-quote-2022" },
  { id: 295, slug: "chiusura-circolo-natale-2021", url: "https://santasabina.altervista.org/index.php/notizie/295-chiusura-circolo-natale-2021" },
  { id: 293, slug: "torneo-sociale-autunno-2021", url: "https://santasabina.altervista.org/index.php/notizie/293-torneo-sociale-autunno-2021" },
  { id: 292, slug: "certificazione-verde-covid-19-green-pass", url: "https://santasabina.altervista.org/index.php/notizie/292-certificazione-verde-covid-19-green-pass" },
  { id: 291, slug: "chiusura-estiva-circolo", url: "https://santasabina.altervista.org/index.php/notizie/291-chiusura-estiva-circolo" },
  { id: 290, slug: "venerdi-11-giugno-il-circolo-riapre", url: "https://santasabina.altervista.org/index.php/notizie/290-venerdi-11-giugno-il-circolo-riapre" },
  { id: 289, slug: "iscrizione-al-circolo-e-quote-2021", url: "https://santasabina.altervista.org/index.php/notizie/289-iscrizione-al-circolo-e-quote-2021" },
  { id: 288, slug: "circolo-scacchi-chiuso-2", url: "https://santasabina.altervista.org/index.php/notizie/288-circolo-scacchi-chiuso-2" },
  { id: 287, slug: "torneo-sociale-autunno-2020-prog", url: "https://santasabina.altervista.org/index.php/notizie/287-torneo-sociale-autunno-2020-prog" },
  { id: 286, slug: "torneo-sociale-autunno-2020", url: "https://santasabina.altervista.org/index.php/notizie/286-torneo-sociale-autunno-2020" },
  { id: 271, slug: "torneo-rapid-10min-bando-2", url: "https://santasabina.altervista.org/index.php/notizie/271-torneo-rapid-10min-bando-2" },
  { id: 285, slug: "torneo-rapid-10min-end", url: "https://santasabina.altervista.org/index.php/notizie/285-torneo-rapid-10min-end" },
  { id: 284, slug: "chiusura-estiva-corcolo", url: "https://santasabina.altervista.org/index.php/notizie/284-chiusura-estiva-corcolo" },
  { id: 283, slug: "circolo-scacchi-riapre-02", url: "https://santasabina.altervista.org/index.php/notizie/283-circolo-scacchi-riapre-02" },
  { id: 282, slug: "circolo-scacchi-riapre-01", url: "https://santasabina.altervista.org/index.php/notizie/282-circolo-scacchi-riapre-01" },
  { id: 281, slug: "circolo-scacchi-chiuso-01", url: "https://santasabina.altervista.org/index.php/notizie/281-circolo-scacchi-chiuso-01" },
  { id: 278, slug: "campionato-italiano-a-squadre-cis-2020-avviso", url: "https://santasabina.altervista.org/index.php/notizie/278-campionato-italiano-a-squadre-cis-2020-avviso" },
  { id: 279, slug: "circolo-scacchi-chiuso", url: "https://santasabina.altervista.org/index.php/notizie/279-circolo-scacchi-chiuso" },
  { id: 280, slug: "torneo-sociale-grand-prix-2020-sospeso", url: "https://santasabina.altervista.org/index.php/notizie/280-torneo-sociale-grand-prix-2020-sospeso" },
  { id: 277, slug: "torneo-sociale-grand-prix-2020-pre", url: "https://santasabina.altervista.org/index.php/notizie/277-torneo-sociale-grand-prix-2020-pre" },
  { id: 276, slug: "torneo-sociale-grand-prix-2020-tappa", url: "https://santasabina.altervista.org/index.php/notizie/276-torneo-sociale-grand-prix-2020-tappa" },
  { id: 297, slug: "natale-panettone-2021", url: "https://santasabina.altervista.org/index.php/notizie/297-natale-panettone-2021" },
  { id: 272, slug: "lutto", url: "https://santasabina.altervista.org/index.php/notizie/272-lutto" },
  { id: 270, slug: "7-open-internazionale-del-levante-ligure-under-16", url: "https://santasabina.altervista.org/index.php/notizie/270-7-open-internazionale-del-levante-ligure-under-16" },
  { id: 269, slug: "torneo-natale-2019-u12-end", url: "https://santasabina.altervista.org/index.php/notizie/269-torneo-natale-2019-u12-end" },
  { id: 268, slug: "torneo-sociale-grand-prix-2019-end", url: "https://santasabina.altervista.org/index.php/notizie/268-torneo-sociale-grand-prix-2019-end" },
  { id: 267, slug: "torneo-natale-2019-u12", url: "https://santasabina.altervista.org/index.php/notizie/267-torneo-natale-2019-u12" },
  { id: 238, slug: "torneo-sociale-grand-prix-2019-pre", url: "https://santasabina.altervista.org/index.php/notizie/238-torneo-sociale-grand-prix-2019-pre" },
  { id: 266, slug: "torneo-sociale-rapid-natale-2019", url: "https://santasabina.altervista.org/index.php/notizie/266-torneo-sociale-rapid-natale-2019" },
  { id: 235, slug: "torneo-sociale-grand-prix-2019-tappa", url: "https://santasabina.altervista.org/index.php/notizie/235-torneo-sociale-grand-prix-2019-tappa" },
  { id: 265, slug: "memorial-valentini", url: "https://santasabina.altervista.org/index.php/notizie/265-memorial-valentini" },
  { id: 264, slug: "torneo-sociale-autunno-2019-end", url: "https://santasabina.altervista.org/index.php/notizie/264-torneo-sociale-autunno-2019-end" },
  { id: 263, slug: "torneo-patronale-2019-end", url: "https://santasabina.altervista.org/index.php/notizie/263-torneo-patronale-2019-end" },
  { id: 262, slug: "crs-2019-u16-end", url: "https://santasabina.altervista.org/index.php/notizie/262-crs-2019-u16-end" },
  { id: 261, slug: "torneo-sociale-autunno-2019-prog", url: "https://santasabina.altervista.org/index.php/notizie/261-torneo-sociale-autunno-2019-prog" },
  { id: 260, slug: "torneo-patronale-2019", url: "https://santasabina.altervista.org/index.php/notizie/260-torneo-patronale-2019" },
  { id: 259, slug: "torneo-sociale-autunno-2019", url: "https://santasabina.altervista.org/index.php/notizie/259-torneo-sociale-autunno-2019" },
  { id: 258, slug: "xxiv-memorial-bertolini-partite", url: "https://santasabina.altervista.org/index.php/notizie/258-xxiv-memorial-bertolini-partite" },
  { id: 257, slug: "xxiv-memorial-bertolini-2019-end-3", url: "https://santasabina.altervista.org/index.php/notizie/257-xxiv-memorial-bertolini-2019-end-3" },
  { id: 250, slug: "torneo-sociale-primavera-2019-end1", url: "https://santasabina.altervista.org/index.php/notizie/250-torneo-sociale-primavera-2019-end1" },
  { id: 253, slug: "torneo-di-fine-anno-scuola-n-s-del-monte", url: "https://santasabina.altervista.org/index.php/notizie/253-torneo-di-fine-anno-scuola-n-s-del-monte" },
  { id: 252, slug: "xvii-memorial-sigona-under-12-end", url: "https://santasabina.altervista.org/index.php/notizie/252-xvii-memorial-sigona-under-12-end" },
  { id: 251, slug: "xxiv-memorial-bertolini-2019-prog", url: "https://santasabina.altervista.org/index.php/notizie/251-xxiv-memorial-bertolini-2019-prog" },
  { id: 247, slug: "torneo-sociale-primavera-2019-prog", url: "https://santasabina.altervista.org/index.php/notizie/247-torneo-sociale-primavera-2019-prog" },
  { id: 249, slug: "xvii-memorial-sigona-under-12", url: "https://santasabina.altervista.org/index.php/notizie/249-xvii-memorial-sigona-under-12" },
  { id: 248, slug: "lorenzo-danesi-miglior-rapid-under-14", url: "https://santasabina.altervista.org/index.php/notizie/248-lorenzo-danesi-miglior-rapid-under-14" },
  { id: 246, slug: "torneo-scacchi-calcio-2019-end", url: "https://santasabina.altervista.org/index.php/notizie/246-torneo-scacchi-calcio-2019-end" },
  { id: 245, slug: "campionato-provinciale-2019-u16-end", url: "https://santasabina.altervista.org/index.php/notizie/245-campionato-provinciale-2019-u16-end" },
  { id: 244, slug: "torneo-propaganda-2019-end", url: "https://santasabina.altervista.org/index.php/notizie/244-torneo-propaganda-2019-end" },
  { id: 243, slug: "tss-2019", url: "https://santasabina.altervista.org/index.php/notizie/243-tss-2019" },
  { id: 237, slug: "torneo-scacchi-calcio-2019", url: "https://santasabina.altervista.org/index.php/notizie/237-torneo-scacchi-calcio-2019" },
  { id: 242, slug: "campionato-provinciale-2019-u16-bando-2", url: "https://santasabina.altervista.org/index.php/notizie/242-campionato-provinciale-2019-u16-bando-2" },
  { id: 240, slug: "campionato-italiano-a-squadre-cis-2019", url: "https://santasabina.altervista.org/index.php/notizie/240-campionato-italiano-a-squadre-cis-2019" },
  { id: 241, slug: "torneo-propaganda-2019", url: "https://santasabina.altervista.org/index.php/notizie/241-torneo-propaganda-2019" },
  { id: 236, slug: "torneo-scacchi-calcio-2019-pre", url: "https://santasabina.altervista.org/index.php/notizie/236-torneo-scacchi-calcio-2019-pre" },
  { id: 232, slug: "torneo-scacchi-calcio-2019-bando", url: "https://santasabina.altervista.org/index.php/notizie/232-torneo-scacchi-calcio-2019-bando" },
  { id: 230, slug: "torneo-sociale-rapid-natale-2018-end", url: "https://santasabina.altervista.org/index.php/notizie/230-torneo-sociale-rapid-natale-2018-end" },
  { id: 229, slug: "torneo-sociale-rapid-natale-2018-prog", url: "https://santasabina.altervista.org/index.php/notizie/229-torneo-sociale-rapid-natale-2018-prog" },
  { id: 227, slug: "iscrizione-e-quote-2019", url: "https://santasabina.altervista.org/index.php/notizie/227-iscrizione-e-quote-2019" },
  { id: 207, slug: "torneo-sociale-grand-prix-2018-pre", url: "https://santasabina.altervista.org/index.php/notizie/207-torneo-sociale-grand-prix-2018-pre" },
  { id: 167, slug: "torneo-sociale-grand-prix-2018-tappa", url: "https://santasabina.altervista.org/index.php/notizie/167-torneo-sociale-grand-prix-2018-tappa" },
  { id: 224, slug: "torneo-sociale-autunno-2018-end", url: "https://santasabina.altervista.org/index.php/notizie/224-torneo-sociale-autunno-2018-end" },
  { id: 223, slug: "torneo-patronale-2018", url: "https://santasabina.altervista.org/index.php/notizie/223-torneo-patronale-2018" },
  { id: 222, slug: "torneo-sociale-autunno-2018-prog", url: "https://santasabina.altervista.org/index.php/notizie/222-torneo-sociale-autunno-2018-prog" },
  { id: 221, slug: "torneo-sociale-autunno-2018", url: "https://santasabina.altervista.org/index.php/notizie/221-torneo-sociale-autunno-2018" },
  { id: 220, slug: "xxiii-memorial-bertolini-2018-end", url: "https://santasabina.altervista.org/index.php/notizie/220-xxiii-memorial-bertolini-2018-end" },
  { id: 219, slug: "torneo-sociale-di-primavera-2018", url: "https://santasabina.altervista.org/index.php/notizie/219-torneo-sociale-di-primavera-2018" },
  { id: 218, slug: "campionato-regionale-a-squadre-u16", url: "https://santasabina.altervista.org/index.php/notizie/218-campionato-regionale-a-squadre-u16" },
  { id: 217, slug: "torneo-istituto-suore-francescane", url: "https://santasabina.altervista.org/index.php/notizie/217-torneo-istituto-suore-francescane" },
  { id: 216, slug: "xvi-memorial-sigona-under-12-end", url: "https://santasabina.altervista.org/index.php/notizie/216-xvi-memorial-sigona-under-12-end" },
  { id: 214, slug: "torneo-scacchi-calcio-2018-end2", url: "https://santasabina.altervista.org/index.php/notizie/214-torneo-scacchi-calcio-2018-end2" },
  { id: 215, slug: "xvi-memorial-sigona-under-12", url: "https://santasabina.altervista.org/index.php/notizie/215-xvi-memorial-sigona-under-12" },
  { id: 213, slug: "torneo-sociale-primavera-2018", url: "https://santasabina.altervista.org/index.php/notizie/213-torneo-sociale-primavera-2018" },
  { id: 212, slug: "torneo-scacchi-calcio-2018-end1", url: "https://santasabina.altervista.org/index.php/notizie/212-torneo-scacchi-calcio-2018-end1" },
  { id: 211, slug: "campionato-provinciale-2018-u16-end", url: "https://santasabina.altervista.org/index.php/notizie/211-campionato-provinciale-2018-u16-end" },
  { id: 209, slug: "campionato-provinciale-2018-u16-bando-2", url: "https://santasabina.altervista.org/index.php/notizie/209-campionato-provinciale-2018-u16-bando-2" },
  { id: 177, slug: "xxiii-memorial-bertolini-2018-prog", url: "https://santasabina.altervista.org/index.php/notizie/177-xxiii-memorial-bertolini-2018-prog" },
  { id: 208, slug: "cis-2018-end", url: "https://santasabina.altervista.org/index.php/notizie/208-cis-2018-end" },
  { id: 206, slug: "torneo-scacchi-calcio-2018-bando", url: "https://santasabina.altervista.org/index.php/notizie/206-torneo-scacchi-calcio-2018-bando" },
  { id: 202, slug: "torneo-sociale-grand-prix-2018-bando", url: "https://santasabina.altervista.org/index.php/notizie/202-torneo-sociale-grand-prix-2018-bando" },
  { id: 233, slug: "torneo-sociale-grand-prix-2019-bando", url: "https://santasabina.altervista.org/index.php/notizie/233-torneo-sociale-grand-prix-2019-bando" },
  { id: 199, slug: "torneo-sociale-semilampo-natale-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/199-torneo-sociale-semilampo-natale-2017-end" },
  { id: 198, slug: "torneo-natale-2017-u12-end", url: "https://santasabina.altervista.org/index.php/notizie/198-torneo-natale-2017-u12-end" },
  { id: 197, slug: "torneo-sociale-grand-prix-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/197-torneo-sociale-grand-prix-2017-end" },
  { id: 228, slug: "torneo-sociale-grand-prix-2018-end", url: "https://santasabina.altervista.org/index.php/notizie/228-torneo-sociale-grand-prix-2018-end" },
  { id: 169, slug: "torneo-sociale-grand-prix-2017-pre-tappa", url: "https://santasabina.altervista.org/index.php/notizie/169-torneo-sociale-grand-prix-2017-pre-tappa" },
  { id: 194, slug: "iscrizione-e-quote-2018", url: "https://santasabina.altervista.org/index.php/notizie/194-iscrizione-e-quote-2018" },
  { id: 195, slug: "torneo-sociale-semilampo-natale-2017", url: "https://santasabina.altervista.org/index.php/notizie/195-torneo-sociale-semilampo-natale-2017" },
  { id: 225, slug: "torneo-sociale-rapid-natale-2018", url: "https://santasabina.altervista.org/index.php/notizie/225-torneo-sociale-rapid-natale-2018" },
  { id: 196, slug: "torneo-natale-2017-u12", url: "https://santasabina.altervista.org/index.php/notizie/196-torneo-natale-2017-u12" },
  { id: 205, slug: "torneo-sociale-grand-prix-2017-tappa", url: "https://santasabina.altervista.org/index.php/notizie/205-torneo-sociale-grand-prix-2017-tappa" },
  { id: 193, slug: "assemblea-annuale-soci-2017", url: "https://santasabina.altervista.org/index.php/notizie/193-assemblea-annuale-soci-2017" },
  { id: 190, slug: "campionato-regionale-2017-under-16", url: "https://santasabina.altervista.org/index.php/notizie/190-campionato-regionale-2017-under-16" },
  { id: 189, slug: "torneo-patronale-2017-post", url: "https://santasabina.altervista.org/index.php/notizie/189-torneo-patronale-2017-post" },
  { id: 188, slug: "torneo-patronale-2017", url: "https://santasabina.altervista.org/index.php/notizie/188-torneo-patronale-2017" },
  { id: 191, slug: "torneo-sociale-autunno-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/191-torneo-sociale-autunno-2017-end" },
  { id: 187, slug: "torneo-sociale-autunno-2017-prog", url: "https://santasabina.altervista.org/index.php/notizie/187-torneo-sociale-autunno-2017-prog" },
  { id: 186, slug: "torneo-sociale-autunno-2017", url: "https://santasabina.altervista.org/index.php/notizie/186-torneo-sociale-autunno-2017" },
  { id: 181, slug: "campionato-italiano-2017-under-16", url: "https://santasabina.altervista.org/index.php/notizie/181-campionato-italiano-2017-under-16" },
  { id: 185, slug: "xxii-memorial-bertolini-partite", url: "https://santasabina.altervista.org/index.php/notizie/185-xxii-memorial-bertolini-partite" },
  { id: 184, slug: "xxii-memorial-bertolini-2017-post", url: "https://santasabina.altervista.org/index.php/notizie/184-xxii-memorial-bertolini-2017-post" },
  { id: 183, slug: "torneo-sociale-primavera-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/183-torneo-sociale-primavera-2017-end" },
  { id: 180, slug: "torneo-sociale-primavera-2017-prog", url: "https://santasabina.altervista.org/index.php/notizie/180-torneo-sociale-primavera-2017-prog" },
  { id: 179, slug: "xv-memorial-sigona-under-12", url: "https://santasabina.altervista.org/index.php/notizie/179-xv-memorial-sigona-under-12" },
  { id: 176, slug: "torneo-sociale-primavera-2017", url: "https://santasabina.altervista.org/index.php/notizie/176-torneo-sociale-primavera-2017" },
  { id: 210, slug: "xxii-memorial-bertolini-2017", url: "https://santasabina.altervista.org/index.php/notizie/210-xxii-memorial-bertolini-2017" },
  { id: 178, slug: "triathlon-di-beneficenza-a-pietra-ligure", url: "https://santasabina.altervista.org/index.php/notizie/178-triathlon-di-beneficenza-a-pietra-ligure" },
  { id: 175, slug: "cis-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/175-cis-2017-end" },
  { id: 174, slug: "campionato-italiano-a-squadre-cis-2017", url: "https://santasabina.altervista.org/index.php/notizie/174-campionato-italiano-a-squadre-cis-2017" },
  { id: 170, slug: "torneo-preparazione-cis-2017-end", url: "https://santasabina.altervista.org/index.php/notizie/170-torneo-preparazione-cis-2017-end" },
  { id: 166, slug: "campionato-provinciale-2017-u16-bando", url: "https://santasabina.altervista.org/index.php/notizie/166-campionato-provinciale-2017-u16-bando" },
  { id: 171, slug: "campionato-provinciale-2017-u16-end", url: "https://santasabina.altervista.org/index.php/notizie/171-campionato-provinciale-2017-u16-end" },
  { id: 163, slug: "torneo-sociale-grand-prix-2017-bando", url: "https://santasabina.altervista.org/index.php/notizie/163-torneo-sociale-grand-prix-2017-bando" },
  { id: 162, slug: "torneo-preparazione-cis-2017", url: "https://santasabina.altervista.org/index.php/notizie/162-torneo-preparazione-cis-2017" },
  { id: 161, slug: "saluto-dalessandro", url: "https://santasabina.altervista.org/index.php/notizie/161-saluto-dalessandro" },
  { id: 160, slug: "torneo-sociale-semilampo-natale-2016-end", url: "https://santasabina.altervista.org/index.php/notizie/160-torneo-sociale-semilampo-natale-2016-end" },
  { id: 159, slug: "torneo-sociale-semilampo-natale-2016-prog", url: "https://santasabina.altervista.org/index.php/notizie/159-torneo-sociale-semilampo-natale-2016-prog" },
  { id: 158, slug: "iscrizione-e-quote-2017", url: "https://santasabina.altervista.org/index.php/notizie/158-iscrizione-e-quote-2017" },
  { id: 157, slug: "torneo-sociale-semilampo-natale-2016", url: "https://santasabina.altervista.org/index.php/notizie/157-torneo-sociale-semilampo-natale-2016" },
  { id: 153, slug: "torneo-patronale-2016-post", url: "https://santasabina.altervista.org/index.php/notizie/153-torneo-patronale-2016-post" },
  { id: 150, slug: "torneo-patronale-2016", url: "https://santasabina.altervista.org/index.php/notizie/150-torneo-patronale-2016" },
  { id: 149, slug: "torneo-sociale-autunno-2016-prog", url: "https://santasabina.altervista.org/index.php/notizie/149-torneo-sociale-autunno-2016-prog" },
  { id: 154, slug: "torneo-sociale-autunno-2016-end", url: "https://santasabina.altervista.org/index.php/notizie/154-torneo-sociale-autunno-2016-end" },
  { id: 148, slug: "scacchi-terremotati-201609", url: "https://santasabina.altervista.org/index.php/notizie/148-scacchi-terremotati-201609" },
  { id: 147, slug: "torneo-sociale-autunno-2016", url: "https://santasabina.altervista.org/index.php/notizie/147-torneo-sociale-autunno-2016" },
  { id: 145, slug: "in-vacanza-con-gli-scacchi", url: "https://santasabina.altervista.org/index.php/notizie/145-in-vacanza-con-gli-scacchi" },
  { id: 144, slug: "xxi-memorial-bertolini-partite", url: "https://santasabina.altervista.org/index.php/notizie/144-xxi-memorial-bertolini-partite" },
  { id: 141, slug: "campionato-regionale-2016-under-16-01", url: "https://santasabina.altervista.org/index.php/notizie/141-campionato-regionale-2016-under-16-01" },
  { id: 132, slug: "xiv-memorial-sigona-under-12-post", url: "https://santasabina.altervista.org/index.php/notizie/132-xiv-memorial-sigona-under-12-post" },
  { id: 130, slug: "torneo-sociale-primavera-2016-prog", url: "https://santasabina.altervista.org/index.php/notizie/130-torneo-sociale-primavera-2016-prog" },
  { id: 129, slug: "xiv-memorial-sigona-under-12", url: "https://santasabina.altervista.org/index.php/notizie/129-xiv-memorial-sigona-under-12" },
  { id: 112, slug: "torneo-sociale-grand-prix-2016-pre-tappa", url: "https://santasabina.altervista.org/index.php/notizie/112-torneo-sociale-grand-prix-2016-pre-tappa" },
  { id: 126, slug: "torneo-sociale-primavera-2016", url: "https://santasabina.altervista.org/index.php/notizie/126-torneo-sociale-primavera-2016" },
  { id: 88, slug: "xxi-memorial-bertolini", url: "https://santasabina.altervista.org/index.php/notizie/88-xxi-memorial-bertolini" },
  { id: 135, slug: "cis-2016-commento", url: "https://santasabina.altervista.org/index.php/notizie/135-cis-2016-commento" },
  { id: 111, slug: "campionato-italiano-a-squadre-cis-2016", url: "https://santasabina.altervista.org/index.php/notizie/111-campionato-italiano-a-squadre-cis-2016" },
  { id: 106, slug: "torneo-sociale-grand-prix-2016-tappa", url: "https://santasabina.altervista.org/index.php/notizie/106-torneo-sociale-grand-prix-2016-tappa" },
  { id: 156, slug: "torneo-sociale-grand-prix-2016-end", url: "https://santasabina.altervista.org/index.php/notizie/156-torneo-sociale-grand-prix-2016-end" },
  { id: 109, slug: "campionato-provinciale-2016-under-16", url: "https://santasabina.altervista.org/index.php/notizie/109-campionato-provinciale-2016-under-16" },
  { id: 127, slug: "campionato-provinciale-2016-under-16-01", url: "https://santasabina.altervista.org/index.php/notizie/127-campionato-provinciale-2016-under-16-01" },
  { id: 143, slug: "xxi-memorial-bertolini-2", url: "https://santasabina.altervista.org/index.php/notizie/143-xxi-memorial-bertolini-2" },
  { id: 104, slug: "torneo-di-propaganda-under-12", url: "https://santasabina.altervista.org/index.php/notizie/104-torneo-di-propaganda-under-12" },
  { id: 103, slug: "torneo-sociale-grand-prix-2016-bando", url: "https://santasabina.altervista.org/index.php/notizie/103-torneo-sociale-grand-prix-2016-bando" },
  { id: 102, slug: "torneo-sociale-semilampo-natale-2015-end", url: "https://santasabina.altervista.org/index.php/notizie/102-torneo-sociale-semilampo-natale-2015-end" },
  { id: 59, slug: "nn-torneo-sociale-grand-prix-2015", url: "https://santasabina.altervista.org/index.php/notizie/59-nn-torneo-sociale-grand-prix-2015" },
  { id: 100, slug: "iscrizione-e-quote-2016", url: "https://santasabina.altervista.org/index.php/notizie/100-iscrizione-e-quote-2016" },
  { id: 99, slug: "torneo-sociale-semilampo-natale-2015", url: "https://santasabina.altervista.org/index.php/notizie/99-torneo-sociale-semilampo-natale-2015" },
  { id: 98, slug: "xii-campionato-italiano-a-squadre-under-16", url: "https://santasabina.altervista.org/index.php/notizie/98-xii-campionato-italiano-a-squadre-under-16" },
  { id: 97, slug: "torneo-weekend-valbisagno-2015-end", url: "https://santasabina.altervista.org/index.php/notizie/97-torneo-weekend-valbisagno-2015-end" },
  { id: 96, slug: "torneo-sociale-autunno-2015-end", url: "https://santasabina.altervista.org/index.php/notizie/96-torneo-sociale-autunno-2015-end" },
  { id: 75, slug: "torneo-sociale-grand-prix-2015-ris", url: "https://santasabina.altervista.org/index.php/notizie/75-torneo-sociale-grand-prix-2015-ris" },
  { id: 95, slug: "torneo-sociale-autunno-2015-diario", url: "https://santasabina.altervista.org/index.php/notizie/95-torneo-sociale-autunno-2015-diario" },
  { id: 94, slug: "torneo-sociale-autunno-2015-prog", url: "https://santasabina.altervista.org/index.php/notizie/94-torneo-sociale-autunno-2015-prog" },
  { id: 92, slug: "torneo-sociale-autunno-2015", url: "https://santasabina.altervista.org/index.php/notizie/92-torneo-sociale-autunno-2015" },
  { id: 93, slug: "torneo-weekend-valbisagno-2015", url: "https://santasabina.altervista.org/index.php/notizie/93-torneo-weekend-valbisagno-2015" },
  { id: 91, slug: "xx-memorial-bertolini-01", url: "https://santasabina.altervista.org/index.php/notizie/91-xx-memorial-bertolini-01" },
  { id: 90, slug: "torneo-sociale-primavera-2015-e", url: "https://santasabina.altervista.org/index.php/notizie/90-torneo-sociale-primavera-2015-e" },
  { id: 89, slug: "campionato-regionale-a-squadre-under-16", url: "https://santasabina.altervista.org/index.php/notizie/89-campionato-regionale-a-squadre-under-16" },
  { id: 108, slug: "xx-memorial-bertolini", url: "https://santasabina.altervista.org/index.php/notizie/108-xx-memorial-bertolini" },
  { id: 87, slug: "memorial-sigona-2015-under-12-1", url: "https://santasabina.altervista.org/index.php/notizie/87-memorial-sigona-2015-under-12-1" },
  { id: 85, slug: "torneo-sociale-primavera-2015-p", url: "https://santasabina.altervista.org/index.php/notizie/85-torneo-sociale-primavera-2015-p" },
  { id: 84, slug: "campionato-provinciale-2015-under-16-0", url: "https://santasabina.altervista.org/index.php/notizie/84-campionato-provinciale-2015-under-16-0" },
  { id: 82, slug: "campionato-italiano-a-squadre-cis-2015", url: "https://santasabina.altervista.org/index.php/notizie/82-campionato-italiano-a-squadre-cis-2015" },
  { id: 79, slug: "torneo-sociale-primavera-2015", url: "https://santasabina.altervista.org/index.php/notizie/79-torneo-sociale-primavera-2015" },
  { id: 78, slug: "campionato-provinciale-2015-under-16", url: "https://santasabina.altervista.org/index.php/notizie/78-campionato-provinciale-2015-under-16" },
  { id: 69, slug: "torneo-sociale-semilampo-natale-2014", url: "https://santasabina.altervista.org/index.php/notizie/69-torneo-sociale-semilampo-natale-2014" },
  { id: 74, slug: "4-torneo-giovanile-under-16-01", url: "https://santasabina.altervista.org/index.php/notizie/74-4-torneo-giovanile-under-16-01" },
  { id: 67, slug: "4-torneo-giovanile-under-16", url: "https://santasabina.altervista.org/index.php/notizie/67-4-torneo-giovanile-under-16" },
  { id: 68, slug: "iscrizione-e-quote-2015", url: "https://santasabina.altervista.org/index.php/notizie/68-iscrizione-e-quote-2015" },
  { id: 70, slug: "torneo-sociale-grand-prix-2014-fin", url: "https://santasabina.altervista.org/index.php/notizie/70-torneo-sociale-grand-prix-2014-fin" },
  { id: 101, slug: "torneo-sociale-grand-prix-2015-fin-2", url: "https://santasabina.altervista.org/index.php/notizie/101-torneo-sociale-grand-prix-2015-fin-2" },
  { id: 65, slug: "torneo-patronale-2014", url: "https://santasabina.altervista.org/index.php/notizie/65-torneo-patronale-2014" },
  { id: 61, slug: "torneo-sociale-autunno-2014", url: "https://santasabina.altervista.org/index.php/notizie/61-torneo-sociale-autunno-2014" },
  { id: 60, slug: "torneo-weekend-valbisagno-2014", url: "https://santasabina.altervista.org/index.php/notizie/60-torneo-weekend-valbisagno-2014" },
  { id: 56, slug: "memorial-sigona-2014-under-12", url: "https://santasabina.altervista.org/index.php/notizie/56-memorial-sigona-2014-under-12" },
  { id: 86, slug: "memorial-sigona-2015-under-12", url: "https://santasabina.altervista.org/index.php/notizie/86-memorial-sigona-2015-under-12" },
  { id: 55, slug: "xix-memorial-bertolini", url: "https://santasabina.altervista.org/index.php/notizie/55-xix-memorial-bertolini" },
  { id: 58, slug: "concluso-xix-memorial-bertolini", url: "https://santasabina.altervista.org/index.php/notizie/58-concluso-xix-memorial-bertolini" },
  { id: 54, slug: "torneo-sociale-primavera-2014", url: "https://santasabina.altervista.org/index.php/notizie/54-torneo-sociale-primavera-2014" },
  { id: 53, slug: "concluso-campionato-italiano-a-squadre-2014", url: "https://santasabina.altervista.org/index.php/notizie/53-concluso-campionato-italiano-a-squadre-2014" },
  { id: 52, slug: "campionato-provinciale-2014-under-16", url: "https://santasabina.altervista.org/index.php/notizie/52-campionato-provinciale-2014-under-16" },
  { id: 51, slug: "3-torneo-giovanile-under-16", url: "https://santasabina.altervista.org/index.php/notizie/51-3-torneo-giovanile-under-16" },
  { id: 48, slug: "posticipo-primo-turno-grand-prix-2014", url: "https://santasabina.altervista.org/index.php/notizie/48-posticipo-primo-turno-grand-prix-2014" },
  { id: 45, slug: "torneo-sociale-grand-prix-2014", url: "https://santasabina.altervista.org/index.php/notizie/45-torneo-sociale-grand-prix-2014" },
  { id: 38, slug: "torneo-semilampo-natale-2013", url: "https://santasabina.altervista.org/index.php/notizie/38-torneo-semilampo-natale-2013" },
  { id: 39, slug: "torneo-natale-under12-2013", url: "https://santasabina.altervista.org/index.php/notizie/39-torneo-natale-under12-2013" },
  { id: 44, slug: "buon-natale-2013", url: "https://santasabina.altervista.org/index.php/notizie/44-buon-natale-2013" },
  { id: 31, slug: "n-torneo-sociale-grand-prix-2013", url: "https://santasabina.altervista.org/index.php/notizie/31-n-torneo-sociale-grand-prix-2013" },
  { id: 43, slug: "we-valbisagno-online", url: "https://santasabina.altervista.org/index.php/notizie/43-we-valbisagno-online" },
  { id: 42, slug: "iscrizione-e-quote-2014", url: "https://santasabina.altervista.org/index.php/notizie/42-iscrizione-e-quote-2014" },
  { id: 40, slug: "torneo-patronale-2013", url: "https://santasabina.altervista.org/index.php/notizie/40-torneo-patronale-2013" },
  { id: 41, slug: "torneo-sociale-autunno-2013", url: "https://santasabina.altervista.org/index.php/notizie/41-torneo-sociale-autunno-2013" },
  { id: 37, slug: "torneo-weekend-valbisagno-2013", url: "https://santasabina.altervista.org/index.php/notizie/37-torneo-weekend-valbisagno-2013" },
  { id: 19, slug: "xviii-memorial-bertolini", url: "https://santasabina.altervista.org/index.php/notizie/19-xviii-memorial-bertolini" },
  { id: 16, slug: "campionato-provinciale-2013-under-16", url: "https://santasabina.altervista.org/index.php/notizie/16-campionato-provinciale-2013-under-16" },
  { id: 35, slug: "memorial-sigona-2013-under-12", url: "https://santasabina.altervista.org/index.php/notizie/35-memorial-sigona-2013-under-12" },
  { id: 32, slug: "torneo-sociale-primavera-2013", url: "https://santasabina.altervista.org/index.php/notizie/32-torneo-sociale-primavera-2013" },
  { id: 36, slug: "torneo-suore-francescane-2013", url: "https://santasabina.altervista.org/index.php/notizie/36-torneo-suore-francescane-2013" },
  { id: 29, slug: "campionato-regionale-a-squadre-2013-unde-r16", url: "https://santasabina.altervista.org/index.php/notizie/29-campionato-regionale-a-squadre-2013-unde-r16" },
  { id: 28, slug: "concluso-campionato-italiano-a-squadre-2013", url: "https://santasabina.altervista.org/index.php/notizie/28-concluso-campionato-italiano-a-squadre-2013" },
  { id: 27, slug: "torneo-ociale-2013-under-14", url: "https://santasabina.altervista.org/index.php/notizie/27-torneo-ociale-2013-under-14" },
  { id: 2, slug: "campionato-italiano-a-squadre-cis-2013", url: "https://santasabina.altervista.org/index.php/notizie/2-campionato-italiano-a-squadre-cis-2013" },
  { id: 6, slug: "torneo-sociale-grand-prix-2013", url: "https://santasabina.altervista.org/index.php/notizie/6-torneo-sociale-grand-prix-2013" },
  { id: 3, slug: "torneo-sociale-semilampo-natale-2012", url: "https://santasabina.altervista.org/index.php/notizie/3-torneo-sociale-semilampo-natale-2012" },
];

const OUTPUT_DIR = resolve('./scripts/scraped-raw');

function htmlToMarkdown(html) {
  const $ = cheerio.load(html);

  // Remove images
  $('img').remove();

  // Convert links
  $('a').each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const text = $el.text().trim();
    if (text && href) {
      $el.replaceWith(`[${text}](${href.startsWith('/') ? 'https://santasabina.altervista.org' + href : href})`);
    } else if (text) {
      $el.replaceWith(text);
    }
  });

  // Convert bold
  $('strong, b').each((i, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text) {
      $el.replaceWith(`**${text}**`);
    }
  });

  // Convert italic
  $('em, i').each((i, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text) {
      $el.replaceWith(`*${text}*`);
    }
  });

  // Convert <br> to newlines
  $('br').replaceWith('\n');

  // Get text from paragraphs and divs
  let result = '';
  const body = $('body').length ? $('body') : $.root();

  body.children().each((i, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase();
    const text = $el.text().trim();
    if (!text) return;

    if (tag === 'table') {
      // Convert tables to simple text
      $el.find('tr').each((j, tr) => {
        const cells = [];
        $(tr).find('td, th').each((k, td) => {
          const cellText = $(td).text().trim();
          if (cellText) cells.push(cellText);
        });
        if (cells.length) result += cells.join(' | ') + '\n';
      });
      result += '\n';
    } else if (tag === 'ul' || tag === 'ol') {
      $el.find('li').each((j, li) => {
        result += `- ${$(li).text().trim()}\n`;
      });
      result += '\n';
    } else {
      // Get the HTML of this element and do text extraction
      result += text + '\n\n';
    }
  });

  // Also handle case where content is just inline text
  if (!result.trim()) {
    result = body.text().trim();
  }

  return result.replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchPage(entry) {
  try {
    const res = await fetch(entry.url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
      console.error(`HTTP ${res.status} for ${entry.id}-${entry.slug}`);
      return null;
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('h2[itemprop="name"]').text().trim() ||
                  $('h1').first().text().trim() ||
                  $('title').text().trim();

    // Extract article body HTML
    const bodyHtml = $('div[itemprop="articleBody"]').html() || '';

    if (!bodyHtml) {
      console.error(`No articleBody for ${entry.id}-${entry.slug}`);
      return null;
    }

    // Convert to markdown-ish text
    const bodyMd = htmlToMarkdown(bodyHtml);

    return { id: entry.id, slug: entry.slug, title, body: bodyMd, rawHtml: bodyHtml };
  } catch (err) {
    console.error(`Error fetching ${entry.id}-${entry.slug}: ${err.message}`);
    return null;
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const BATCH_SIZE = 5;
  const results = [];

  for (let i = 0; i < LINKS.length; i += BATCH_SIZE) {
    const batch = LINKS.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchPage));

    for (const r of batchResults) {
      if (r) {
        results.push(r);
        // Save raw HTML + extracted text
        const filename = `${r.id}-${r.slug}.json`;
        writeFileSync(
          resolve(OUTPUT_DIR, filename),
          JSON.stringify({ id: r.id, slug: r.slug, title: r.title, body: r.body, rawHtml: r.rawHtml }, null, 2)
        );
      }
    }

    const done = Math.min(i + BATCH_SIZE, LINKS.length);
    console.log(`Progress: ${done}/${LINKS.length} (${results.length} OK)`);

    // Small delay between batches
    if (i + BATCH_SIZE < LINKS.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\nDone! ${results.length}/${LINKS.length} pages scraped.`);

  // Save summary
  const summary = results.map(r => ({ id: r.id, slug: r.slug, title: r.title, bodyLength: r.body.length }));
  writeFileSync(resolve(OUTPUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2));
}

main();