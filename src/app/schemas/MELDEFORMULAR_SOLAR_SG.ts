// import { ISchema, IComponent, SchemaManager } from 'src/app/components/bi-formular-engine/src/public-api';
// import { IdentityContextDTO } from '../api/model/models';
import { inputGroup, inputGroupCL, label, w_full, card_panel, card_hint_panel, switch_hint_panel, checkBoxGroup } from '../schema-utils';
import * as moment from 'moment';
// import { marker } from '@ngneat/transloco-keys-manager/marker';
import { ISchema, IComponent, SchemaManager } from "src/bi-formular-engine/src/public-api";
// import { card_hint_panel, card_panel, label_Input, schemaClassLayout } from "../schema-utils";

const FORMULAR_TYP_MELDEFORMULAR_SOLAR_SG = "MELDEFORMULAR_SOLAR_SG";
const FORMULAR_TYP_SITUATIONSPLAN = "SITUATIONSPLAN";
const FORMULAR_TYP_GRUNDRISSPLAN = "GRUNDRISSPLAN"; //nur bei Flachdach
const FORMULAR_TYP_FASSADENPLAN = "FASSADENPLAN";

const MELDEFORMULAR_SOLAR_SG_AnlageStandort: IComponent = card_panel('Anlage-Standort', 'MELDEFORMULAR_SOLAR_SG_AnlageStandort', [
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
            ]
         },
      ]
   },
]);

const MELDEFORMULAR_SOLAR_SG_Adressen: IComponent = card_panel('Adressen / Geschäftspartner', '', [
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
            name: 'einreicher', //Gesuchssteller
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
            name: 'sachbearbeiter', //Projektverfasser
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
            name: 'eigentuemer', //Grundeigentümer
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

const MELDEFORMULAR_SOLAR_SG_ThSolaranlage: IComponent = switch_hint_panel('Thermische Solaranlage', 'MELDEFORMULAR_SOLAR_SG_ThSolaranlage', 'TH_ANLAGE', false, '(Warmwasser)', [
   // label('', true),
   checkBoxGroup([
      { label: 'Flachkollektoren', field: 'TH_FLACHKOLLEKTOREN' },
      { label: 'Röhrenkollektoren', field: 'TH_ROEHRENKOLLEKTOREN' },
   ], { required: false }),
]);

const MELDEFORMULAR_SOLAR_SG_PvSolaranlage: IComponent = switch_hint_panel('Photovoltaikanlage', 'MELDEFORMULAR_SOLAR_SG_PvSolaranlage', 'PV_ANLAGE', true, '(Elektrizität)', [
   label('Gesamtleistung (kWp)'),
   {
      type: 'input',
      dataType: 'string',
      field: 'PV_GESAMTLEISTUNG',
      max: 10,
   },
   label('Standort Wechselrichter'),
   {
      type: 'input',
      dataType: 'string',
      field: 'PV_STANDORT', //Platzhalter
      max: 20,
   },
]);

const MELDEFORMULAR_SOLAR_SG_AnlageAuausfuehrung: IComponent = card_panel('Anlage-Ausführung', 'MELDEFORMULAR_SOLAR_SG_AnlageAuausfuehrung', [
   label('Dachfläche im rechten Winkel um	höchstens 20 cm überragend', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_DF20CM_JA' },
      { label: 'Nein', field: 'AA_DF20CM_NEIN' },
   ]),
   label('Nicht über die Dachfläche herausragend', true),
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
   label('Blitzschutzanlage vorhanden', true),
   checkBoxGroup([
      { label: 'Ja', field: 'AA_BLITZSCHUTZ_JA' }, //Platzhalter
      { label: 'Nein', field: 'AA_BLITZSCHUTZ_NEIN' }, //Platzhalter
   ]),
   label('Gesamtfläche der Anlage'),
   {
      type: 'input',
      dataType: 'float',
      field: 'PV_ABSORBERFLAECHE', //gleich gelassen wie bei Meldeform Schwyz???
      suffix: 'm²',
      max: 10,
   },
   label('Farbe von Kollektor', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_FARBE_KOLLEKTOR', //Platzhalter
         max: 15,
      }]),
   label('Farbe von Rahmen', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_FARBE_RAHMEN', //Platzhalter
         max: 15,
      }]),
   label('Farbe der Leitungen und Anschlüsse', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_FARBE_LEITUNG', //Platzhalter
         max: 30,
      }]),
   label('Bausumme (Fr.)', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_BAUSUMME', //Platzhalter
         max: 30,
      }]),
   label('Voraussichtliche Inbetriebnahme', true),
   inputGroup([
      {
         type: 'input',
         field: 'AA_INBETRIEBNAHME', //Platzhalter
         max: 30,
      }]),

]);

export const MELDEFORMULAR_SOLAR_SG: ISchema = {
   type: 'panel',
   name: 'MELDEFORMULAR_SOLAR_SG',
   label: 'Meldeformular Solar (SG)',
   iconText: 'MFSG',
   pdfTemplate: 'DA5223B6-8170-4429-BC34-20FC750983E3',
   pdfFileName: label,
   guid: FORMULAR_TYP_MELDEFORMULAR_SOLAR_SG,
   attribut: 'c785ec2a-fd3e-4c7c-9ef1-64948973e870',
  //  beilagen: [
      // { guid: FORMULAR_TYP_SITUATIONSPLAN, titel: 'Situationsplan' },
      // { guid: FORMULAR_TYP_GRUNDRISSPLAN, titel: 'Grundrissplan' }, //zusätzlich bei SG
      // { guid: FORMULAR_TYP_FASSADENPLAN, titel: 'Fassadenplan' },
  //  ],
  //  steps: [
  //     { step: 1, titel: 'Sperren', status: MELDEFORMULAR_SOLAR_SG_Status.Sperren, target: 'MELDEFORMULAR_SOLAR_SG_Unterschriften' },
  //     { step: 2, titel: 'Senden', status: MELDEFORMULAR_SOLAR_SG_Status.Senden, target: 'MELDEFORMULAR_SOLAR_SG_Unterschriften' },
  //     { step: 3, titel: 'Antwort erhalten', status: MELDEFORMULAR_SOLAR_SG_Status.Gesendet, target: 'MELDEFORMULAR_SOLAR_SG_Unterschriften' },
  //  ],
   classLayout: 'w-full',
   children: [
      MELDEFORMULAR_SOLAR_SG_AnlageStandort,
      MELDEFORMULAR_SOLAR_SG_Adressen,
      // MELDEFORMULAR_SOLAR_SG_Gesuchsteller,
      // MELDEFORMULAR_SOLAR_SG_Grundeigentümer,
      MELDEFORMULAR_SOLAR_SG_ThSolaranlage,
      MELDEFORMULAR_SOLAR_SG_PvSolaranlage,
      MELDEFORMULAR_SOLAR_SG_AnlageAuausfuehrung,
      // MELDEFORMULAR_SOLAR_SG_Unterlagen,
      // MELDEFORMULAR_SOLAR_SG_Unterschriften,
   ],
   async initFormular(sm: SchemaManager) {
      // const service = sm.service;
      sm.getCompByName('einreicher_spinner').loading = true;
      // try {
      //    const gs = await service.GetCurrentGeschStelle()
      //    sm.setValues(
      //       [
      //          'I_KONZESS',
      //          'I_NAME1',
      //          'I_NAME2',
      //          'I_ADRESSE1',
      //          'I_ADRESSE2',
      //          'I_PLZ',
      //          'I_ORT']
      //       ,
      //       [
      //          gs.iNummer,
      //          gs.firma1,
      //          gs.firma2,
      //          gs.adresse,
      //          gs.adrzusatz,
      //          gs.plz,
      //          gs.ort]
      //    )
      //    sm.getCompByName('einreicher_spinner').loading = false;
      //    sm.getCompByName('sachb_spinner').loading = true;
      //    const ma = await service.GetCurrentMitarbeiter()
      //    sm.setValues(
      //       [
      //          'I_SACHB',
      //          'I_EMAIL',
      //          'I_TELNRD',
      //          'I_TELNRM'
      //       ]
      //       ,
      //       [
      //          `${ma.vorname} ${ma.name}`,
      //          ma.eMailD,
      //          ma.telefonD,
      //          ma.telefonM
      //       ]
      //    )
      //    sm.getCompByName('sachb_spinner').loading = false;
      //    if (sm.projekt.gebaeude?.guid_Inhaber) {
      //       sm.getCompByName('eigent_spinner').loading = true;
      //       const a = await service.GetAdressse(sm.projekt.gebaeude.guid_Inhaber)
      //       sm.setValues(
      //          [
      //             'U_NAME1',
      //             'U_NAME2',
      //             'U_ADRESSE1',
      //             'U_ADRESSE2',
      //             'U_PLZ',
      //             'U_ORT',
      //             'U_TELNR',
      //             'U_EMAIL'
      //          ],
      //          [
      //             a.name1,
      //             a.name2,
      //             a.adresse1,
      //             a.adresse2,
      //             a.plz,
      //             a.ort,
      //             a.telefon,
      //             a.eMail
      //          ]
      //       )
      //       sm.getCompByName('eigent_spinner').loading = false;

      //    }

      //    sm.setValues(
      //       [
      //          'O_STRASSE',
      //          'O_HAUSNR',
      //          'O_PLZ',
      //          'O_ORT',
      //          'GEMEINDE',
      //          'PARZELLE',
      //          'EGID',
      //          'I_TEXT',
      //          'TERMIN'
      //       ],

      //       [
      //          sm.projekt.gebaeude?.strasse,
      //          sm.projekt.gebaeude?.hausNr,
      //          sm.projekt.gebaeude?.plz,
      //          sm.projekt.gebaeude?.postOrt,
      //          sm.projekt.gebaeude?.gemeinde,
      //          sm.projekt.gebaeude?.parzelleNr,
      //          sm.projekt.gebaeude?.egid,
      //          sm.projekt.auftrag?.bemerkungen,
      //          sm.projekt.auftrag?.datumInbetrieb
      //       ]
      //    )

      //    let flaeche = 0;
      //    let leistung = 0;
      //    sm.projekt.gebaeude?.geraete?.filter(g => g.typ === 'PV-Modul').forEach(g => {
      //       let data = JSON.parse(g.daten);
      //       if (data.stk_RISO && data.area_m2)
      //          flaeche += data.stk_RISO * data.area_m2;
      //       if (data.stk_RISO && data.peak_power_w)
      //          leistung += data.stk_RISO * data.peak_power_w;
      //    });
      //    if (flaeche)
      //       sm.setValue('PV_ABSORBERFLAECHE', flaeche);
      //    if (leistung)
      //       sm.setValue('PV_GESAMTLEISTUNG', leistung);


      //    if (!sm.Values.FormStatus)
      //       this.setStatus(sm, sm.Values.FormStatus);

      //    if (sm.Values.UX_UNTERSCHRIFT)
      //       sm.DisableAll(true);
      //    else
      //       sm.DisableAll(false);

      //    //Daten speichern in DB
      //    if (sm.ValuesChanged) {
      //       await sm.saveValuesToDB()
      //    }

      // }
      // catch (err) {
      //    console.error(err)
      // }
      // finally {
      //    sm.getCompByName('einreicher_spinner').loading = false;
      //    sm.getCompByName('sachb_spinner').loading = false;
      //    sm.getCompByName('eigent_spinner').loading = false;
      // }

   },
  //  onChange(sm, comp) {
  //     sm.getCompByField('TH_FLACHKOLLEKTOREN_TH_ROEHRENKOLLEKTOREN').required = sm.Values.TH_ANLAGE;
  //     sm.getCompByField('TH_BRAUCHWARMWASSER_TH_HEIZUNGSUNTERSTUETZUNG').required = sm.Values.TH_ANLAGE;
  //     sm.getCompByField('TH_ABSORBERFLAECHE').required = sm.Values.TH_ANLAGE;
  //     sm.getCompByField('TH_INBETRIEBNAHME').required = sm.Values.TH_ANLAGE;

  //     sm.getCompByField('PV_ABSORBERFLAECHE').required = sm.Values.PV_ANLAGE;
  //     sm.getCompByField('PV_GESAMTLEISTUNG').required = sm.Values.PV_ANLAGE;
  //     sm.getCompByField('PV_JAHRESERTRAG').required = sm.Values.PV_ANLAGE;
  //     sm.getCompByField('PV_INBETRIEBNAHME').required = true;

  //     if ((comp.required || comp.parentComp?.required) && sm.Values.FormStatus == MELDEFORMULAR_SOLAR_SG_Status.InArbeit) {
  //        const mussfelder = { anzahl: 0, filled: 0 }
  //        sm.GetFormularMussfelder(mussfelder);
  //        if (mussfelder.anzahl === mussfelder.filled)
  //           sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SG_Status.Sperren);
  //        else
  //           sm.Schema.setStatus(sm, MELDEFORMULAR_SOLAR_SG_Status.InArbeit);
  //     }
  //  },
  //  setStatus(sm: SchemaManager, status: MELDEFORMULAR_SOLAR_SG_Status) {
  //     if (sm.Values.FormStatus !== status) {
  //        sm.setValueSave('FormStatus', status);
  //     }
  //     sm.Schema.SetFormularStatus(status, MELDEFORMULAR_SOLAR_SG_StatusText[status], true);
  //  },
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
  //  onAfterSave(sm, formular) {
  //     console.log('Called from schema onAfterSave: ', formular)
  //  },
  //  onAfterReload(sm, formular) {
  //     console.log('Called from schema onAfterReload: ', formular)
  //  },
}
