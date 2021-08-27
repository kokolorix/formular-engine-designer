import { ISchema, IComponent, SchemaManager } from 'src/app/components/bi-formular-engine/src/public-api';
import { IdentityContextDTO } from '../api/model/models';
import { inputGroup, inputGroupCL, label, w_full, card_panel, card_hint_panel, switch_hint_panel, checkBoxGroup, formular_status_test } from './schema-utils';
import * as moment from 'moment';
import { FormularStatus } from '../services';

const FORMULAR_TYP_MELDEFORMULAR_SOLAR_SZ = "e0ea8cd1-a4ef-418d-b3db-e6b66fc42fc4";
const FORMULAR_TYP_SITUATIONSPLAN = "2f5ccbbc-db19-4ce7-a1a3-b8ac7a6435e4";
const FORMULAR_TYP_FASSADENPLAN = "60f61104-9d07-4e92-bfae-886e625fea0b";

enum MELDEFORMULAR_SOLAR_SZ_Status {
   InArbeit = 1,
   Sperren = 2,
   Gesperrt = 3,
   Gedruckt = 5,
   Senden = 6,
   Gesendet = 7,
   AntwortErhalten = 9,
}
// const MELDEFORMULAR_SOLAR_SZ_StatusText: { [key in MELDEFORMULAR_SOLAR_SZ_Status]: string } = {
//    [MELDEFORMULAR_SOLAR_SZ_Status.InArbeit]: marker('form_status.in_arbeit'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.Sperren]: marker('form_status.sperren'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt]: marker('form_status.gesperrt'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.Gedruckt]: marker('form_status.gedruckt'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.Senden]: marker('form_status.senden'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.Gesendet]: marker('form_status.gesendet'),
//    [MELDEFORMULAR_SOLAR_SZ_Status.AntwortErhalten]: marker('form_status.antwort_erhalten'),
// }

const MELDEFORMULAR_SOLAR_SZ_AnlageStandort: IComponent = card_panel('Anlage-Standort', 'MELDEFORMULAR_SOLAR_SZ_AnlageStandort', [
   {
      type: 'panel',
      name: 'projekt_daten',
      classLayout: 'grid grid-3-cols-auto col-span-3',
      // class: 'col-span-3',
      onGetClass(sm, comp, def, name) {
         if (name === 'panel')
            return `${def} panel-from-superior`;
         return def;
      },
      // style: 'border-left: 4px solid rgb(252, 196, 47); padding-left: 0.5rem;',
      children: [
         { type: 'label', label: 'Standortangaben', classLayout: 'text-xs font-bold col-span-2', },
         { type: 'label', label: 'Nummern', classLayout: 'text-xs font-bold col-start-3', },
         {
            type: 'panel',
            name: 'standort_daten1',
            classLayout: ` col-start-1 col-span-1`,
            children: [
               { type: 'label', label: 'Standort', classLayout: 'text-xs mt-2', },
               inputGroupCL('mr-2', [
                  { type: 'label', field: 'O_STRASSE', classLayout: 'mt-2', },
                  { type: 'label', field: 'O_HAUSNR', classLayout: '', },
               ]),
               inputGroupCL('mr-2', [
                  { type: 'label', field: 'O_PLZ', classLayout: 'mt-2', },
                  { type: 'label', field: 'O_ORT', classLayout: '', },
               ]),
            ]
         },
         {
            type: 'panel',
            name: 'standort_daten2',
            classLayout: ` col-start-2 col-span-1`,
            children: [
               { type: 'label', label: 'Koordinaten', classLayout: 'text-xs mt-2', hidden(sm) { return !sm.Values.O_KOORDINATEN } },
               { type: 'label', field: 'O_KOORDINATEN', classLayout: '', },
               { type: 'label', label: 'Gemeinde', classLayout: 'text-xs mt-2', },
               { type: 'label', field: 'GEMEINDE', classLayout: '', },
            ]
         },
         {
            type: 'panel',
            name: 'gebaeude_anlage_daten1',
            classLayout: ` col-start-3 col-span-1`,
            children: [
               { type: 'label', label: 'Parzelle-Nr. (KTN)', classLayout: 'text-xs mt-2', },
               { type: 'label', field: 'PARZELLE', classLayout: '', },
               { type: 'label', label: 'Gebäude-Nr. (EGID)', classLayout: 'text-xs mt-2', },
               { type: 'label', field: 'EGID', classLayout: '', },
               { type: 'label', field: 'I_TEXT', hidden: true, },
               { type: 'label', field: 'TERMIN', hidden: true, },
            ]
         },
      ]
   },
]);

const MELDEFORMULAR_SOLAR_SZ_Adressen: IComponent = card_panel('Adressen / Geschäftspartner', '', [
   {
      type: 'panel',
      classLayout: 'w-full grid grid-3-cols-auto col-span-3',
      onGetClass(sm, comp, def, name) {
         if (name === 'panel')
            return `${def} panel-from-superior`;
         return def;
      },
      children: [
         {
            type: 'panel',
            name: 'einreicher',
            children: [
               { type: 'label', label: 'Einreichendes Unternehmen', classLayout: 'text-xs font-bold', },
               { type: 'spinner', name: 'einreicher_spinner', classLayout: 'mt-2' },
               { type: 'label', field: 'I_KONZESS', },
               { type: 'label', label: 'Adresse', classLayout: ' text-xs mt-2', },
               inputGroupCL('mr-2', [
                  { type: 'label', field: 'I_NAME1', classLayout: 'mt-2', },
                  { type: 'label', field: 'I_NAME2', },
               ]),
               inputGroupCL('mr-2', [
                  { type: 'label', field: 'I_ADRESSE1', },
                  { type: 'label', field: 'I_ADRESSE2', },
               ]),
               inputGroupCL('mr-2', [
                  { type: 'label', field: 'I_PLZ', },
                  { type: 'label', field: 'I_ORT', },
               ]),
               { type: 'label', name: 'LB_I_NAME', },
               { type: 'label', name: 'LB_I_ADR', },
               { type: 'label', name: 'LB_PLZORT', },
            ]
         },
         {
            type: 'panel',
            name: 'sachbearbeiter',
            classLayout: ` col-start-2 col-span-1`,
            children: [
               { type: 'label', label: 'Sachbearbeiter', classLayout: 'text-xs font-bold', },
               { type: 'spinner', name: 'sachb_spinner', classLayout: ' mt-2' },
               { type: 'label', field: 'I_SACHB', },
               { type: 'label', field: 'I_EMAIL', },
               { type: 'label', field: 'I_TELNRD', },
               { type: 'label', field: 'I_TELNRM', hidden: true },
            ]
         },
         {
            type: 'panel',
            name: 'eigentuemer',
            classLayout: ` col-start-3 col-span-1`,
            children: [
               { type: 'label', label: 'Eigentümer', classLayout: 'text-xs font-bold', },
               { type: 'spinner', name: 'eigent_spinner', classLayout: ' mt-2' },
               inputGroup([
                  { type: 'label', field: 'U_NAME1', },
                  { type: 'label', field: 'U_NAME2', },
               ]),
               { type: 'label', field: 'U_ADR1', },
               { type: 'label', field: 'U_ADR2', },
               inputGroup([
                  { type: 'label', field: 'U_PLZ', },
                  { type: 'label', field: 'U_ORT', },
               ]),
               { type: 'label', field: 'U_EMAIL', },
               { type: 'label', field: 'U_TELNR', },
            ]
         },
      ],
   }
]);

const MELDEFORMULAR_SOLAR_SZ_ThSolaranlage: IComponent = switch_hint_panel('Thermische Solaranlage', 'MELDEFORMULAR_SOLAR_SZ_ThSolaranlage', 'TH_ANLAGE', false, '(Wärmeproduktion)', [
   // label('', true),
   checkBoxGroup([
      { label: 'Flachkollektoren', field: 'TH_FLACHKOLLEKTOREN' },
      { label: 'Röhrenkollektoren', field: 'TH_ROEHRENKOLLEKTOREN' },
   ], { required: false }),
   checkBoxGroup([
      { label: 'für Brauchwarmwasser', field: 'TH_BRAUCHWARMWASSER' },
      { label: 'mit Heizungsunterstützung', field: 'TH_HEIZUNGSUNTERSTUETZUNG' },
   ], { required: false, multipleSelection: true }),
   { type: 'label', label: 'Absorberfläche', classLayout: 'col-start-1 col-span-1' },
   {
      type: 'input',
      dataType: 'string',
      field: 'TH_ABSORBERFLAECHE',
      suffix: 'm²',
      max: 10,
      classLayout: 'col-start-2 col-span-2',
      // required: true,
   },
   { type: 'label', label: 'Voraussichtliche Inbetriebnahme', classLayout: 'col-start-1 col-span-1' },
   {
      type: 'date',
      field: 'TH_INBETRIEBNAHME',
      classLayout: 'col-start-2 col-span-2',
   },
]);

const MELDEFORMULAR_SOLAR_SZ_PvSolaranlage: IComponent = switch_hint_panel('Photovoltaikanlage', 'MELDEFORMULAR_SOLAR_SZ_PvSolaranlage', 'PV_ANLAGE', true, '(Stromproduktion)', [
   label('Gesamtfläche der Anlage'),
   {
      type: 'input',
      dataType: 'float',
      field: 'PV_ABSORBERFLAECHE',
      hint: '(ohne Blindfläche)',
      suffix: 'm²',
      max: 10,
   },
   label('Gesamtleistung'),
   {
      type: 'input',
      dataType: 'string',
      field: 'PV_GESAMTLEISTUNG',
      suffix: 'kWpeak',
      max: 10,
   },
   label('Erwarteter Jahresertrag'),
   {
      type: 'input',
      dataType: 'string',
      field: 'PV_JAHRESERTRAG',
      suffix: 'kWh/Jahr',
      max: 10,
   },
   label('Voraussichtliche Inbetriebnahme'),
   {
      type: 'date',
      field: 'PV_INBETRIEBNAHME',
   },
]);

const MELDEFORMULAR_SOLAR_SZ_AnlageAuausfuehrung: IComponent = card_panel('Anlage-Ausführung', 'MELDEFORMULAR_SOLAR_SZ_AnlageAuausfuehrung', [
   label('Dachfläche im rechten Winkel um	höchstens 20 cm überragend', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_DF20CM_JA' },
      { label: 'Nein', field: 'AA_DF20CM_NEIN' },
   ]),
   label('Von vorne und von oben gesehen nicht über die Dachfläche herausragend', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_DF_HERAUSRAGEND_JA' },
      { label: 'Nein', field: 'AA_DF_HERAUSRAGEND_NEIN' },
   ]),
   label('Nach dem Stand der Technik reflexionsarm ausgeführt', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_STAND_DER_TECHNIK_JA' },
      { label: 'Nein', field: 'AA_STAND_DER_TECHNIK_NEIN' },
   ]),
   label('Als kompakte Fläche zusammenhängend ausgeführt', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_KOMPAKT_JA' },
      { label: 'Nein', field: 'AA_KOMPAKT_NEIN' },
   ]),

   checkBoxGroup([
      { label: 'Monokristalline PV-Zellen', field: 'AA_MONO_KRISTALIN' },
      { label: 'Polykristalline PV-Zellen', field: 'AA_POLY_KRISTALIN' },
   ], { required: true, classLayout: 'col-span-2 flex mb-2 mt-6' }),

   label('Farbe Kollektorrahmen, Leitungen und Anschlüsse', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_FARBE',
         max: 30,
      }]),
]);

const MELDEFORMULAR_SOLAR_SZ_Unterschriften: IComponent = card_hint_panel('Unterschriften', 'MELDEFORMULAR_SOLAR_SZ_Unterschriften', '(Gesuchsteller)', [
   { type: 'input', field: 'FormStatus', hidden(sm) { return true; }, },
   label('Ort'),
   {
      type: 'input',
      dataType: 'string',
      field: 'UX_ORT',
      max: 30,
   },
   label('Datum'),
   {
      type: 'date',
      field: 'UX_DATUM',
   },
   label('Unterschrift'),
   {
      type: 'panel',
      classLayout: 'flex flex-wrap items-center',
      children: [
         { type: 'label', field: 'UX_UNTERSCHRIFT', classLayout: 'mt-2', hidden(sm) { return !sm.Values.UX_UNTERSCHRIFT; }, },
         {
            type: 'button', kind: 'raised', color: 'primary', label: 'Sperren', icon: 'lock',
            onClick(sm) {
               sm.getCompByName('signature_spinner').loading = true;
               const service = sm.service;
               let cic: IdentityContextDTO = service.CurIdentity;
               if (!sm.Values.UX_ORT) {
                  service.GetCurrentGeschStelle().then(gs => {
                     sm.setValuesSave(
                        [
                           'UX_ORT',
                           'UX_DATUM',
                           'UX_UNTERSCHRIFT'

                        ]
                        ,
                        [
                           `${gs.ort}`,
                           moment(new Date().toDateString()).date,
                           `${cic.mitarbeiterVorname} ${cic.mitarbeiterNachname}`

                        ]
                     )
                     sm.saveStatus(FormularStatus.Signiert)
                     sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt);
                     sm.DisableAll(true);
                     sm.getCompByName('signature_spinner').loading = false;
                     setTimeout(() => { document.querySelector('#' + 'MELDEFORMULAR_SOLAR_SZ_Unterschriften').scrollIntoView(); }, 0)
                  }).catch(e => {
                     console.error(e);
                     sm.getCompByName('signature_spinner').loading = false;
                  })
               }
               else {
                  sm.setValuesSave(
                     [
                        'UX_DATUM',
                        'UX_UNTERSCHRIFT'

                     ]
                     ,
                     [
                        moment(new Date().toDateString()).date,
                        `${cic.mitarbeiterVorname} ${cic.mitarbeiterNachname}`

                     ]
                  )
                  sm.saveStatus(FormularStatus.Signiert)
                  sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt);
                  sm.DisableAll(true);
                  sm.getCompByName('signature_spinner').loading = false;
                  setTimeout(() => { document.querySelector('#' + 'MELDEFORMULAR_SOLAR_SZ_Unterschriften').scrollIntoView(); }, 0)
               }
            },
            disabled(sm) { return false },
            hidden(sm) { return sm.Values.UX_UNTERSCHRIFT || sm.Values.FormStatus < MELDEFORMULAR_SOLAR_SZ_Status.Sperren; },
         },
         { type: 'spinner', name: 'signature_spinner' },
      ]
   },
   inputGroupCL('mt-2 mr-2', [
      {
         type: 'button', kind: 'raised', color: 'primary', label: 'Drucken', icon: 'print',
         disabled(sm) { return false },
         hidden(sm) {
            return sm.Values.FormStatus < MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt || sm.Values.FormStatus >= MELDEFORMULAR_SOLAR_SZ_Status.Gesendet
         },
         onClick(sm, comp) {
            sm.saveStatus(FormularStatus.Gedruckt)
            sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Gedruckt);
            sm.Schema.PrintFormular(true);
         }
      },
      {
         type: 'button', kind: 'raised', color: 'primary', label: 'Entsperren', icon: 'lock_open',
         disabled(sm) { return false },
         hidden(sm) {
            return sm.Values.FormStatus < MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt || sm.Values.FormStatus >= MELDEFORMULAR_SOLAR_SZ_Status.Gesendet
         },
         onClick(sm) {
            sm.setValuesSave(
               [
                  'UX_DATUM',
                  'UX_UNTERSCHRIFT',
                  'UX_PDF_UNTERSCHRIEBEN',
                  'UX_VERSENDET',
                  'UX_PDF_BEWILLIGT'

               ]
               ,
               [
                  null,
                  undefined,
                  undefined,
                  undefined,
                  undefined,

               ]
            )
            sm.DisableAll(false);
            sm.saveStatus(FormularStatus.Signiert)
            sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Sperren);
         },
      },
   ]),
   {
      type: 'html',
      name: 'MELDEFORMULAR_SOLAR_SZ_UNTERSCHRIEBEN',
      classLayout: 'col-start-2 mt-2',
      onClick(sm, comp) {
         sm.saveStatus(FormularStatus.Verschickt)
         sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Senden);
      },
      hidden(sm) { return sm.Values.FormStatus < MELDEFORMULAR_SOLAR_SZ_Status.Gesperrt || sm.Values.FormStatus >= MELDEFORMULAR_SOLAR_SZ_Status.Senden },
      disabled(sm) { return false },
      html: `
			<div class="file-uploader col-start-2">
				<svg xmlns="http://www.w3.org/2000/svg" height=22 width=22 class="file-icon">
					<path
						d="M13,2,7.5,7.5h4.4v9.9h2.2V7.5h4.4ZM2,9.7V21.8A2.216,2.216,0,0,0,4.2,24H21.8A2.216,2.216,0,0,0,24,21.8V9.7H21.8V21.8H4.2V9.7Z" transform="translate(-2 -2)">
					</path>
				</svg>
				<span class="file-text">Unterschriebenes Formular</span>
			</div>
`,
   },
   { type: 'spinner', name: 'versendet_spinner' },
   {
      type: 'button', kind: 'raised', color: 'primary', label: 'Versendet', icon: 'send', classLayout: 'col-start-2 mt-2',
      onClick(sm, comp) {
         sm.getCompByName('versendet_spinner').loading = true;
         setTimeout(() => {
            sm.saveStatus(FormularStatus.Verschickt)
            sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Gesendet);
            sm.getCompByName('versendet_spinner').loading = false;
         }, 2500);
      },
      hidden(sm) { return sm.Values.FormStatus < MELDEFORMULAR_SOLAR_SZ_Status.Senden || sm.Values.FormStatus >= MELDEFORMULAR_SOLAR_SZ_Status.Gesendet },
      disabled(sm) { return false },
   },
   {
      type: 'html',
      classLayout: 'col-start-2 mt-2',
      onClick(sm, comp) {
         sm.saveStatus(FormularStatus.ErhaltBestaetigt)
         sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.AntwortErhalten);
      },
      hidden(sm) { return sm.Values.FormStatus != MELDEFORMULAR_SOLAR_SZ_Status.Gesendet },
      disabled(sm) { return false },
      html: `
			<div class="file-uploader">
				<svg xmlns="http://www.w3.org/2000/svg" height=22 width=22 class="file-icon">
					<path d="M13,2,7.5,7.5h4.4v9.9h2.2V7.5h4.4ZM2,9.7V21.8A2.216,2.216,0,0,0,4.2,24H21.8A2.216,2.216,0,0,0,24,21.8V9.7H21.8V21.8H4.2V9.7Z" transform="translate(-2 -2)"/>
				</svg>
				<span class="file-text">Bewilligtes Formular</span>
			</div>
		`,
   },
]);

export const MELDEFORMULAR_SOLAR_SZ: ISchema = {
   type: 'panel',
   name: 'MELDEFORMULAR_SOLAR_SZ',
   label: 'Meldeformular Solar (SZ)',
   iconText: 'MFS',
   pdfTemplate: 'DA5223B6-8170-4429-BC34-20FC750983E3',
   pdfFileName: label,
   guid: FORMULAR_TYP_MELDEFORMULAR_SOLAR_SZ,
   attribut: 'c785ec2a-fd3e-4c7c-9ef1-64948973e870',
   beilagen: [
      { guid: FORMULAR_TYP_SITUATIONSPLAN, titel: 'Situationsplan' },
      { guid: FORMULAR_TYP_FASSADENPLAN, titel: 'Fassadenplan' },
   ],
   steps: [
      { step: 1, titel: 'Sperren', status: MELDEFORMULAR_SOLAR_SZ_Status.Sperren, target: 'MELDEFORMULAR_SOLAR_SZ_Unterschriften' },
      { step: 2, titel: 'Senden', status: MELDEFORMULAR_SOLAR_SZ_Status.Senden, target: 'MELDEFORMULAR_SOLAR_SZ_Unterschriften' },
      { step: 3, titel: 'Antwort erhalten', status: MELDEFORMULAR_SOLAR_SZ_Status.Gesendet, target: 'MELDEFORMULAR_SOLAR_SZ_Unterschriften' },
   ],
   classLayout: 'w-full',
   children: [
      MELDEFORMULAR_SOLAR_SZ_AnlageStandort,
      MELDEFORMULAR_SOLAR_SZ_Adressen,
      // MELDEFORMULAR_SOLAR_SZ_Gesuchsteller,
      // MELDEFORMULAR_SOLAR_SZ_Grundeigentümer,
      MELDEFORMULAR_SOLAR_SZ_ThSolaranlage,
      MELDEFORMULAR_SOLAR_SZ_PvSolaranlage,
      MELDEFORMULAR_SOLAR_SZ_AnlageAuausfuehrung,
      // MELDEFORMULAR_SOLAR_SZ_Unterlagen,
      MELDEFORMULAR_SOLAR_SZ_Unterschriften,

   ],
   async initFormular(sm: SchemaManager) {
      const service = sm.service;
      sm.getCompByName('einreicher_spinner').loading = true;
      try {
         const gs = await service.GetCurrentGeschStelle()
         sm.setValues(
            [
               'I_KONZESS',
               'I_NAME1',
               'I_NAME2',
               'I_ADRESSE1',
               'I_ADRESSE2',
               'I_PLZ',
               'I_ORT']
            ,
            [
               gs.iNummer,
               gs.firma1,
               gs.firma2,
               gs.adresse,
               gs.adrzusatz,
               gs.plz,
               gs.ort]
         )
         sm.getCompByName('einreicher_spinner').loading = false;
         sm.getCompByName('sachb_spinner').loading = true;
         const ma = await service.GetCurrentMitarbeiter()
         sm.setValues(
            [
               'I_SACHB',
               'I_EMAIL',
               'I_TELNRD',
               'I_TELNRM'
            ]
            ,
            [
               `${ma.vorname} ${ma.name}`,
               ma.eMailD,
               ma.telefonD,
               ma.telefonM
            ]
         )
         sm.getCompByName('sachb_spinner').loading = false;
         if (sm.projekt.gebaeude?.guid_Inhaber) {
            sm.getCompByName('eigent_spinner').loading = true;
            const a = await service.GetAdressse(sm.projekt.gebaeude.guid_Inhaber)
            sm.setValues(
               [
                  'U_NAME1',
                  'U_NAME2',
                  'U_ADRESSE1',
                  'U_ADRESSE2',
                  'U_PLZ',
                  'U_ORT',
                  'U_TELNR',
                  'U_EMAIL'
               ],
               [
                  a.name1,
                  a.name2,
                  a.adresse1,
                  a.adresse2,
                  a.plz,
                  a.ort,
                  a.telefon,
                  a.eMail
               ]
            )
            sm.getCompByName('eigent_spinner').loading = false;

         }

         sm.setValues(
            [
               'O_STRASSE',
               'O_HAUSNR',
               'O_PLZ',
               'O_ORT',
               'GEMEINDE',
               'PARZELLE',
               'EGID',
               'I_TEXT',
               'TERMIN'
            ],

            [
               sm.projekt.gebaeude?.strasse,
               sm.projekt.gebaeude?.hausNr,
               sm.projekt.gebaeude?.plz,
               sm.projekt.gebaeude?.postOrt,
               sm.projekt.gebaeude?.gemeinde,
               sm.projekt.gebaeude?.parzelleNr,
               sm.projekt.gebaeude?.egid,
               sm.projekt.auftrag?.bemerkungen,
               sm.projekt.auftrag?.datumInbetrieb
            ]
         )

         let flaeche = 0;
         let leistung = 0;
         sm.projekt.gebaeude?.geraete?.filter(g => g.typ === 'PV-Modul').forEach(g => {
            let data = JSON.parse(g.daten);
            if (data.stk_RISO && data.area_m2)
               flaeche += data.stk_RISO * data.area_m2;
            if (data.stk_RISO && data.peak_power_w)
               leistung += data.stk_RISO * data.peak_power_w;
         });
         if (flaeche)
            sm.setValue('PV_ABSORBERFLAECHE', flaeche);
         if (leistung)
            sm.setValue('PV_GESAMTLEISTUNG', leistung);


         if (!sm.Values.FormStatus)
            this.setStatus(sm, sm.Values.FormStatus);

         if (sm.Values.UX_UNTERSCHRIFT)
            sm.DisableAll(true);
         else
            sm.DisableAll(false);

         //Daten speichern in DB
         if (sm.ValuesChanged) {
            await sm.saveValuesToDB()
         }

      }
      catch (err) {
         console.error(err)
      }
      finally {
         sm.getCompByName('einreicher_spinner').loading = false;
         sm.getCompByName('sachb_spinner').loading = false;
         sm.getCompByName('eigent_spinner').loading = false;
      }
      //test status setzen
      sm.getCompByName('MELDEFORMULAR_SOLAR_SZ').children.push(formular_status_test())

   },
   onChange(sm, comp) {
      sm.getCompByField('TH_FLACHKOLLEKTOREN_TH_ROEHRENKOLLEKTOREN').required = sm.Values.TH_ANLAGE;
      sm.getCompByField('TH_BRAUCHWARMWASSER_TH_HEIZUNGSUNTERSTUETZUNG').required = sm.Values.TH_ANLAGE;
      sm.getCompByField('TH_ABSORBERFLAECHE').required = sm.Values.TH_ANLAGE;
      sm.getCompByField('TH_INBETRIEBNAHME').required = sm.Values.TH_ANLAGE;

      sm.getCompByField('PV_ABSORBERFLAECHE').required = sm.Values.PV_ANLAGE;
      sm.getCompByField('PV_GESAMTLEISTUNG').required = sm.Values.PV_ANLAGE;
      sm.getCompByField('PV_JAHRESERTRAG').required = sm.Values.PV_ANLAGE;
      sm.getCompByField('PV_INBETRIEBNAHME').required = true;

      if ((comp.required || comp.parentComp?.required) && sm.Values.FormStatus == MELDEFORMULAR_SOLAR_SZ_Status.InArbeit) {
         const mussfelder = { anzahl: 0, filled: 0 }
         sm.GetFormularMussfelder(mussfelder);
         if (mussfelder.anzahl === mussfelder.filled) {
            sm.saveStatus(FormularStatus.Signiert)
            sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.Sperren);
         }
         else {
            sm.saveStatus(FormularStatus.InBearbeitung)
            sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SZ_Status.InArbeit);
         }
      }
   },
   setStatus(sm: SchemaManager, status: MELDEFORMULAR_SOLAR_SZ_Status) {
      if (sm.Values.FormStatus !== status) {
         sm.setValueSave('FormStatus', status);
      }
      // sm.Schema.SetFormularStatus(status, MELDEFORMULAR_SOLAR_SZ_StatusText[status], true);
   },
   getStepLinkData(sm: SchemaManager, step: any): any {
      if (step.status === sm.Values.FormStatus) {
         return {
            icon: '/assets/icons/link_phase_in_progress.svg',
            class: 'fill-in-progress'
         };
      }
      if (step.status < sm.Values.FormStatus) {
         return {
            icon: '/assets/icons/link_phase_done.svg',
            class: 'fill-done'
         };
      }

      return {
         icon: '/assets/icons/link_phase_empty.svg',
         class: 'fill-empty'
      };
   },
   onAfterSave(sm, formular) {
      console.log('Called from schema onAfterSave: ', formular)
   },
   onAfterReload(sm, formular) {
      console.log('Called from schema onAfterReload: ', formular)
   },
}
