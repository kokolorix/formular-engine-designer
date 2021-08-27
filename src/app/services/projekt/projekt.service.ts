import { Injectable, Type } from '@angular/core';
import {
	AdresseDTO,
	// AdressenService,
	EAktionDTO,
	// EAktionenService,
	EAnlageDTO,
	// EAuftraegeService,
	// EAuftragDokumentDTO,
	EAuftragDokumentPoolDTO,
	EAuftragDTO,
	EAuftragPhaseDTO,
	// EDokumenteService,
	EFormularBeilageDTO,
	EFormularDokumentPoolDTO,
	EFormularDTO,
	// EFormulareService,
	EFormularStatus,
	EmpfaengerDTO,
	// EmpfaengerService,
	EProjektDTO,
	// EProjekteService,
	GebaeudeDTO,
	// GebaeudeService,
	GeschStelleDTO,
	// GeschStellenService,
	IdentityContextDTO,
	MitarbeiterDTO,
	// MitarbeiterService,
	PermissionSetDTO,
	PostleitzahlenDTO,
	// PostleitzahlenService,
} from 'src/app/api';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
// import { IdentityContextService } from 'src/app/services/identity-context/identity-context.service';
import { catchError, map } from 'rxjs/operators';
// import { PermissionsViewService } from '../permissions/permissions-view.service';
import { LoadingStatus } from 'src/app/tools/DataListProps';
import { ProjektPhase } from 'src/app/tools';
import * as EventEmitter from 'events';
import { guid_attachment } from '../../schemas/schema-guid-def';
// import { marker } from '@ngneat/transloco-keys-manager/marker';
// import { translate } from '@ngneat/transloco';

export interface INavbarItem {
	titel: string,
	routerLink: string,
	icon: string,
}

export const EmpfaengerKategorienGuids = {
	eigentuemer: "c92cb2d8-de94-4c0d-8a21-42ddfa7f80b8",
	gemeinde: "b053219c-6a38-47d4-9661-2e234b45fbff",
	vnb: "2bf651f0-f779-4492-baf3-35b765feb351",
	einmalverguetung: "22fc1591-ce09-4acb-983a-768d3f8b5e3f",
	kanton: "8614a362-1338-4dcb-bd50-89123846924a"
}

export const PhasenKomponenteGuids = {
	gesuche_baustart: "a774cb79-c119-4c33-bac1-45fdf19f011b",
	apparate_kontrolle: "5155be1f-13d6-4087-9068-613f6578af36",
	pronovo: "3bacbd8d-bdf7-40e5-9e6f-c8d238d5f70e",
}

export const DokumentTypGuids = {
	pdf: '23ABACF4-ECF1-4EA3-98C5-DDC2A74E0767',
	jpg: '99FBFE2F-6FBD-4E77-ACB2-9F8FEDB6D942',
	png: 'F418973A-AF13-4CC1-B374-967B9D4048C4',
	svg: 'CAAEF2CA-72CB-4A82-ABD1-93B4C80FEB1B',
}

export interface FormularTyp {
	guid: string
	titel: string
}

export interface FormularTypen {
	[key: string]: FormularTyp
}


export const FormularTypenGuids: FormularTypen = {
	MF: { guid: '3aa1f096-7508-4258-8aa1-b4ca3da4e89e', titel: 'Meldeformular FR' },
	FAS_PLAN: { guid: '60f61104-9d07-4e92-bfae-886e625fea0b', titel: 'Fassadenplan' },
	SIT_PLAN: { guid: '2f5ccbbc-db19-4ce7-a1a3-b8ac7a6435e4', titel: 'Situationsplan' },
	PRN_VLMT: { guid: 'ce5d2d30-8dd0-4e88-be51-f2956389fb26', titel: 'Pronovo Vollmacht' },
	GRND_ASZ: { guid: 'b1585bec-ffce-44db-904c-ed7e02261e05', titel: 'Grundbuch Auszug' },
	BE: { guid: '817f136e-58d6-4254-86ba-408fc4907814', titel: 'Beilage' },
	BG: { guid: 'a4ea2ae1-43a2-4da6-acce-d4f0b77bfa48', titel: 'Baugesuch' },
	PG: { guid: 'fd07a456-e95e-4cbb-9f1f-fe148c7aa250', titel: 'Pronovo Gesuch' },
	TAG: { guid: '0e502284-436b-4e2b-a566-177919e13dee', titel: 'Technisches Anschlussgesuch' },
	IA: { guid: '72faa42b-4c3b-41bb-a747-cd4e846c991e', titel: 'Installationsanzeige' },
	MPP: { guid: '4d0159cf-f16d-4322-9e7f-3adc6f02d27f', titel: 'Mess- und Prüfprotokoll' },
	PV: { guid: 'ec24c264-f634-41a0-9730-0b81b0115ecb', titel: 'MPP	Mess- und Prüfprotokoll Photovoltaik' },
	SiNa: { guid: '7ec9736c-d24e-4252-b0fc-941c8a3fc028', titel: 'Sicherheitsnachweis' },
	MS: { guid: 'e0ea8cd1-a4ef-418d-b3db-e6b66fc42fc4', titel: 'Meldeformular Solar SZ' },
}

export enum FormularStatus {
	Leer = 0,
	InBearbeitung = 20,
	Signiert = 50,
	TeilSigniert = 51,
	Gedruckt = 52,
	Verschickt = 70,
	ErhaltBestaetigt = 71,
	Bewilligt = 100,
	BewilligtMitMassnahmen = 101,
	Abgelehnt = 120,
}

type FormularStatusInterface = Record<FormularStatus, string>
export const FormularStatusText = (): FormularStatusInterface => ({
	[FormularStatus.Leer]: '',
	[FormularStatus.InBearbeitung]: 'form_status.in_arbeit',
	[FormularStatus.Signiert]:'form_status.unterzeichnet',
	[FormularStatus.TeilSigniert]:'form_status.teil_unterzeichnet',
	[FormularStatus.Gedruckt]:'form_status.gedruckt',
	[FormularStatus.Verschickt]:'form_status.gesendet',
	[FormularStatus.ErhaltBestaetigt]:'form_status.antwort_erhalten',
	[FormularStatus.Bewilligt]:'form_status.bewilligt',
	[FormularStatus.BewilligtMitMassnahmen]:'form_status.bewilligt_massnahmen',
	[FormularStatus.Abgelehnt]:'form_status.abgelehnt',
})

export const FormularGaugeText = (): FormularStatusInterface => ({
	[FormularStatus.Leer]: '',
	[FormularStatus.InBearbeitung]:'form_gauge.in_arbeit',
	[FormularStatus.Signiert]:'form_gauge.unterzeichnet',
	[FormularStatus.TeilSigniert]:'form_gauge.teil_unterzeichnet',
	[FormularStatus.Gedruckt]:'form_gauge.gedruckt',
	[FormularStatus.Verschickt]:'form_gauge.gesendet',
	[FormularStatus.ErhaltBestaetigt]:'form_gauge.antwort_erhalten',
	[FormularStatus.Bewilligt]:'form_gauge.bewilligt',
	[FormularStatus.BewilligtMitMassnahmen]:'form_gauge.bewilligt_massnahmen',
	[FormularStatus.Abgelehnt]:'form_gauge.abgelehnt',
})


export interface FormularStatusSteps {
	step: number
	titel: string
	status: number //FormularStatus
	target: string
}

const StartseiteItem: INavbarItem = {
	titel: 'comp_nav_bar.label_dashboard',
	routerLink: '/dashboard',
	icon: '/assets/icons/nav-dashboard.svg'
}

const ProjekteItem: INavbarItem = {
	titel: 'comp_nav_bar.label_projects',
	routerLink: '/projects',
	icon: '/assets/icons/nav-projects.svg'
}

const GeschStellenItem: INavbarItem = {
	titel: 'comp_nav_bar.label_manage',
	routerLink: '/geschaeftsstellen',
	icon: '/assets/icons/nav-manage.svg'
}

export enum OriginUrl {
	dashboard = '/dashboard',
	verwaltung = '/bi-verwaltung',
	projects = '/projects',
	geschaeftsstellen = '/geschaeftsstellen',
	search = '/search',
}

export const isRoute = (originUrl: OriginUrl, url: string): boolean => {
	return url.indexOf(originUrl) === 0
}

export interface ISaveData {
	name: string
	values: any
}

export interface ISearchData {
	searchText?: string
	originUrl?: string
	old_searchText?: string
	old_originUrl?: string
	overlay?: boolean
	holdingData?: any[]
	holdingData_LoadingStatus?: LoadingStatus
	geschStellenData?: any[]
	geschStellenData_LoadingStatus?: LoadingStatus
	mitarbeiterData?: any[]
	mitarbeiterData_LoadingStatus?: LoadingStatus
	projekteData?: any[]
	projekteData_LoadingStatus?: LoadingStatus
}

export const formStatusField = '_form_status_'

export const dummyAnlage = 'Dummy Anlage'

export const randomNummer = (): string => {
	return Math.floor(Math.random() * 9000000).toString();
}

export interface BreadCrumbItem {
	titel: string
	url?: string
	queryParams?: Params
}

export enum ProgressStatus {
	Leer = 0,
	InArbeit = 1,
	Erledigt = 2,
}

export interface PdfDokument {
	formular?: EFormularDTO
	beilage?: EFormularBeilageDTO
}

export class FormBeilageDef {
	formularTyp: FormularTyp;
	beilage: EFormularBeilageDTO;
	isAttached: boolean;
	getTitel(): string {
		if (this.beilage && this.beilage.dokument) {
			return getDateiNamePrint(this.beilage.dokument.originalName)
		} else {
			return this.formularTyp.titel
		}
	}
	getVerknuepfenText(): string {
		return this.isAttached ? 'verknüpft' : 'verknüpfen'
	}
}

export class BeilageFileDef {
	public beilageGuid: string;
	public file: File
	public fileName: string;
	public formularTypGuid: string;
	public oldfileName: string;
	public oldformularTypGuid: string
	isValid(): boolean {
		return !!this.file && !!this.formularTypGuid
	}
	hasChanged(): boolean {
		if (!this.file) return true
		if (this.fileName !== this.oldfileName) {
			this.file = new File([this.file], this.fileName, {
				type: this.file.type,
				lastModified: this.file.lastModified,
			})

		}
		return (this.fileName !== this.oldfileName || this.formularTypGuid !== this.oldformularTypGuid)
	}
}


export const getDateiNamePrint = (originalName: string): string => {
	if (!originalName) return ''
	const arr = originalName.split('.')
	let dateiname: string = ''
	let extension: string = ''
	let res: string = ''
	if (arr.length > 0) {
		extension = arr.pop()
		dateiname = arr.join('.')
		res = `${dateiname} (${extension})`
	} else {
		res = originalName
	}
	return res
}

export const getFormularTypBeilagenDefs = (formularTyp: FormularTyp, projekt: EProjektDTO, formular: EFormularDTO): FormBeilageDef[] => {
	const res: FormBeilageDef[] = []
	const projektpool: EFormularBeilageDTO[] = projekt.auftrag?.dokumente?.map(d => d.eformularBeilagen_IdFormularBeilagen).filter(b => b?.formularTyp?.guid === formularTyp.guid)
	const formularpool: EFormularBeilageDTO[] = formular?.formularDokumentPool?.map(p => p.formularBeilage).filter(b => b?.formularTyp?.guid === formularTyp.guid)

	if (formularpool) {
		formularpool.forEach(fp => {
			const beilageDef: FormBeilageDef = new FormBeilageDef
			beilageDef.formularTyp = formularTyp
			beilageDef.beilage = fp
			beilageDef.isAttached = true
			res.push(beilageDef)
		})
	}
	if (projektpool) {
		projektpool.forEach(p => {
			const vorhanden = res.find(r => r.beilage.guid === p.guid)
			if (!vorhanden) {
				const beilageDef: FormBeilageDef = new FormBeilageDef
				beilageDef.formularTyp = formularTyp
				beilageDef.beilage = p
				beilageDef.isAttached = false
				res.push(beilageDef)
			}
		})
	}
	if (res.length === 0) {
		const beilageDef: FormBeilageDef = new FormBeilageDef
		beilageDef.formularTyp = formularTyp
		res.push(beilageDef)
	}
	return res
}


@Injectable({
	providedIn: 'root'
})
export class ProjektService {
	//#region Private Felder.

	private _showBreadcrumb: boolean = true;

	//#endregion

	breakPoint_FullHD: number = 1920;
	navbarItems$: BehaviorSubject<INavbarItem[]> = new BehaviorSubject([]);
	NavbarExpanded: boolean = false;
	NotificationbarExpanded: boolean = false;
	CurProjekt: EProjektDTO = null;
	// curPhase: ProjektPhase = null;
	CurAnlage: EAnlageDTO = null;
	CurBeilageFileDef: BeilageFileDef = null
	curFormular?: EFormularDTO
	BreadCrumbData: BreadCrumbItem[] = []
	BreadCrumbInSearch: boolean = false
	Identities: IdentityContextDTO[] = []
	CurIdentity: IdentityContextDTO = null
	permissionSetDTO: PermissionSetDTO = null
	// CurMitarbeiterDTO: MitarbeiterDTO = null
	// CurGeschStelleDTO: GeschStelleDTO = null
	SearchData: ISearchData = {}
	Emitter = new EventEmitter.EventEmitter();

	constructor(
		// private mitarbeiterService: MitarbeiterService,
		// private identityContextService: IdentityContextService,
		// private permissionsViewService: PermissionsViewService,
		// private projekteService: EProjekteService,
		// private aktionenService: EAktionenService,
		// private dokumenteService: EDokumenteService,
		// private formulareService: EFormulareService,
		// private geschStellenService: GeschStellenService,
		// private adressenService: AdressenService,
		// private gebaeudeService: GebaeudeService,
		// private plzService: PostleitzahlenService,
		// private empfaengerService: EmpfaengerService,
		// private auftraegeService: EAuftraegeService,
		private http: HttpClient,
		private router: Router,
		private readonly _activatedRoute: ActivatedRoute
	) {
		// Reagiere auf Ereignisse des Angular Router.
		this.router.events.subscribe(
			(event) => {
				// Es wird von der aktuellen Seite weg navigiert.
				if (event instanceof NavigationEnd) {
					// Entferne den Seitenhintergrund.
					this.setPageBackground(null);
				}
			}
		);

		// this.Emitter.setMaxListeners(0)

		// Wir sind fertig, verlasse die Konstruktor-Funktion.
		return;
	}

	// public get FormularService() { return this.formulareService; }

	public Load_Identity_Berechtigungen(): Promise<string> {
		return new Promise((resolve, reject) => {
			// var navItems: INavbarItem[] = [StartseiteItem, ProjekteItem]
			// this.navbarItems$.next(navItems);
			// this.LoadIdentityContext()
			// 	.then(s => this.LoadBerechtigungenSet())
			// 	.then(s => this.IsHoldingAdmin())
			// 	.then(h => {
			// 		if (h === true) {
			// 			navItems.push(GeschStellenItem);
			// 			this.navbarItems$.next(navItems);
			// 		}
			// 		resolve('')
			// 	})
			// 	.catch(error => {
			// 		reject(error)
			// 	})
		});
	}


	// public IsBIAdmin(): Promise<boolean> {
	// 	return this.permissionsViewService.isBiAdministrator();
	// }

	// public IsHoldingAdmin(): Promise<boolean> {
	// 	return this.permissionsViewService.isHoldingAdministrator();
	// }

	// public LoadBerechtigungenSet(): Promise<string> {
	// 	return this.permissionsViewService.getGlobalIdentityPermissionsSet().toPromise()
	// 		.then(t => '')
	// 		.catch(error => {
	// 			const err = 'No roles for user defined'
	// 			console.error(err, error)
	// 			this.permissionSetDTO = undefined
	// 			return err
	// 		});
	// }

	private LoadIdentityContext(): Promise<string> {
		return new Promise((resolve, reject) => {
			if (this.CurIdentity && this.Identities) {
				resolve('')
				return
			}
			// this.mitarbeiterService.apiV1MitarbeiterApiV1MitarbeiterIdentityGet().pipe(catchError(e => {
			// 	const error = 'Fehler bei Abfrage des Identity Contexts'
			// 	console.error(error)
			// 	reject(error)
			// 	return throwError(e);
			// })).subscribe(
			// 	(data) => {
			// 		data = data ?? [];
			// 		this.Identities = data;
			// 		if (data.length === 1) {
			// 			this.SwitchIdentityContext(data[0])
			// 			resolve('')
			// 		} else if (data.length > 1) {
			// 			resolve('')
			// 		} else {
			// 			const error = 'Identity Context: Keine Identitäten gefunden!'
			// 			console.error(error)
			// 			reject(error)
			// 		}
			// 	})
		}
		)
	}

	SwitchIdentityContext(identity: IdentityContextDTO) {
		this.permissionSetDTO = undefined
		this.CurIdentity = identity
		// this.permissionsViewService.purgePermissionsSetCache()
		// this.identityContextService.switchContext(identity.mandant, identity.holding, identity.geschaeftsstelle, identity.mitarbeiter)
	}

	registerReloadProjekt(fn: any) {
		this.Emitter.on('reloadProjekt', fn)
	}

	unRegisterReloadProjekt(fn: any) {
		this.Emitter.removeListener('reloadProjekt', fn)
	}

	emitReloadProjekt() {
		this.Emitter.emit('reloadProjekt')
	}

	registerLinkBeilage(fn: (formularPool: EFormularDokumentPoolDTO) => void) {
		this.Emitter.on('linkBeilage', fn)
	}

	unRegisterLinkBeilage(fn: (formularPool: EFormularDokumentPoolDTO) => void) {
		this.Emitter.removeListener('linkBeilage', fn)
	}

	emitLinkBeilage(formularPool: EFormularDokumentPoolDTO) {
		this.Emitter.emit('linkBeilage', formularPool)
	}

	registerReloadFormular(fn: any) {
		this.Emitter.on('reloadFormular', fn)
	}

	unRegisterReloadFormular(fn: any) {
		this.Emitter.removeListener('reloadFormular', fn)
	}

	emitReloadFormular() {
		this.Emitter.emit('reloadFormular')
	}

	registerExpandPhase(fn: (projektPhase: ProjektPhase) => void) {
		this.Emitter.on('expandPhase', fn)
	}

	unRegisterExpandPhase(fn: (projektPhase: ProjektPhase) => void) {
		this.Emitter.removeListener('expandPhase', fn)
	}

	emitReloadExpandPhase(projektPhase: ProjektPhase) {
		this.Emitter.emit('expandPhase', projektPhase)
	}

	registerFormularStatusChange(fn: (status: EFormularStatus) => void) {
		this.Emitter.on('formularStatusChange', fn)
	}

	unRegisterFormularStatusChange(fn: (status: EFormularStatus) => void) {
		this.Emitter.removeListener('formularStatusChange', fn)
	}

	emitFormularStatusChange(status: EFormularStatus) {
		this.Emitter.emit('formularStatusChange', status)
	}




	onResize() {
		this.NavbarExpanded = window.innerWidth >= this.breakPoint_FullHD;
	}

	showNotification() {
		this.NotificationbarExpanded = !this.NotificationbarExpanded
	}

	getProjektTitel(projekt: EProjektDTO): string {
		if (!projekt || !projekt.gebaeude) return ''
		const g = projekt.gebaeude
		let res = ''
		if (g.strasse || g.hausNr) {
			res = `${g.strasse}${g.hausNr ? ' ' + g.hausNr : ''}`
			if (g.postOrt) {
				res = `${res}, ${g.postOrt}`
			}
		}
		if (!res && g.postOrt) {
			res = `${g.postOrt}`
		}

		return res
	}

	computePhasenFortschritt(phase: EAuftragPhaseDTO): number {
		let total = 0
		let percent = 0

		phase.leistungen.forEach(l => {
			l.aktionen.forEach(a => {
				total++
				const p = a.dokument ? a.dokument.fortschritt : 0
				percent += p
			});
		})

		if (total === 0) return 0
		const res = Math.round(percent / total)
		return res
	}

	private isMainUrl(): boolean {
		const url = this.router.url
		return (url === OriginUrl.dashboard || url === OriginUrl.geschaeftsstellen || url === OriginUrl.projects || url === OriginUrl.verwaltung)
	}

	isSearchUrl(): boolean {
		const url = this.router.url
		return url.indexOf(OriginUrl.search) === 0
	}


	fillBreadCrumb(items: BreadCrumbItem[]) {
		if (this.isMainUrl()) {
			this.BreadCrumbInSearch = false
		} else if (isRoute(OriginUrl.search, this.router.url)) {
			this.BreadCrumbInSearch = true
		}

		let startItems: BreadCrumbItem[] = []

		// das zweite BreadCrumb Item mit such-item ersetzen / ergänzen falls in einer Suche war
		if (this.BreadCrumbInSearch && this.SearchData.searchText) {
			const searchText = this.SearchData.searchText.split(' ').filter(s => s !== ' ' && s !== '').map(s => '"' + s + '"').join(' und ')
			startItems.push({ titel: `Suche nach ${searchText}`, url: '/search', queryParams: { search: this.SearchData.searchText, originurl: this.SearchData.originUrl } })
			if (items.length === 1) {
				startItems.push(items[0])
			} else if (items.length === 2) {
				startItems.push(items[1])
			}
		} else {
			startItems.push(...items)
		}
		this.BreadCrumbData = startItems
		// if (this.BreadCrumbData.length === 0) {
		// 	this.BreadCrumbData = [{ titel: 'Startseite', url: '/dashboard' }]
		// }
	}


	CurIdentityBenutzerName(): string {
		if (this.CurIdentity) {
			return `${this.CurIdentity.mitarbeiterVorname} ${this.CurIdentity.mitarbeiterNachname}`
		}
    return null;
	}

	/**
	 * Diese Methode setzt den Seiten-Hintergrund auf die angegebene Bild-URL.
	 *
	 * @param imageUrl
	 * 	Die URL des Hintegrundbildes.
	 */
	public setPageBackground(imageUrl: string): void {
		// Diese Konstante speichert den Namen der CSS Variable, mittels welcher das Hintergrundbild der Seite
		// spezifiziert werden kann.
		const cssProperty: string = '--app-layout-background-image';

		// Wurde eine Bild-URL spezifiziert?
		if (imageUrl && imageUrl.length > 0) {
			// Ja, also setzte die spezifizierte URL in der entsprechenden CSS Variable.
			document.documentElement.style.setProperty(cssProperty, `url('${imageUrl}')`);
		}
		else {
			// Nein, also lösche das aktuelle Hintergrundbild.
			document.documentElement.style.setProperty(cssProperty, 'none');
		}

		// Wir sind fertig, kehre nun zurück.
		return;
	}

	/**
	 * Diese Eigenschaft ruft einen Indikator ab, welcher anzeigt ob der Breadcrumb angezeigt werden soll oder nicht.
	 */
	public get showBreadcrumb(): boolean {
		// Gib den intern gespeicherten Indikator zurück.
		return this._showBreadcrumb;
	}

	/**
	 * Diese Eigenschaft setzt den Indikator zum Anzeigen der Breadcrumb oder löscht diesen.
	 *
	 * @param {boolean} show
	 * 	`true` zum Anzeigen der Breadcrumb, ansonsten `false`.
	 *
	 * @default true
	 */
	public set showBreadcrumb(show: boolean) {
		// Speichere den neuen Indikatorwert intern.
		this._showBreadcrumb = show;

		// Und kehre nun zurück.
		return;
	}

	/**
	 * Diese Funktion gibt den Type der Komponente zurück, welche anhand der aktuellen Route aktiviert wurde. Optional
	 * kann vorausgesetzt werden, dass die Route durch eine der Layout-Komponenten aktiviert wurde.
	 *
	 * @param layout
	 * 	`true` um die Aktivierung der Route über eine Layout Komponente vorauszusetzen, ansonsten `false`.
	 *
	 * @return
	 * 	Der Typnamen der aktivierten Komponente oder der `null`-Wert wenn keine Komponente aktiviert wurde.
	 */
	public getRouteComponentName(layout: boolean = true): string {
		// Stelle sicher, dass eine Komponentenroute aktiviert wurde.
		if (this._activatedRoute?.children.length != 1) {
			// Es wurde keine Komponentenroute aktiviert, gib deshalb den `null` Wert zurück.
			return null;
		}

		// Speichere nun die aktivierte Route in einer lokalen Variable.
		let activatedRoute: ActivatedRoute = this._activatedRoute.firstChild;

		// Prüfe ob die Aktivierung einer Komponentenroute via Layout-Komponente vorausgesetzt wird.
		if (true == layout) {
			// Ja, also speichere den Typ der ersten aktivierten Komponente in einer lokalen Variable.
			let component: string | Type<any> = activatedRoute.component;

			// Wurde ein Komponententyp abgerufen?
			if (typeof (component) !== 'string') {
				// Ja, also rufe dessen Klassennamen ab und speichere diesen stattdessen.
				component = component.name;
			}

			// Stelle nun sicher, dass die Route entweder über die Bare-Layout Komponente oder die App-Layout Komponente
			// aktiviert wurde.
			if (
				component != 'AppLayoutComponent' &&
				component != 'BareLayoutComponent'
			) {
				// Die Route wurde nicht über eine der Layout-Komponenten aktiviert, gib deshalb den `null` Wert zurück.
				return null;
			}
		}

		// Iteriere nun über alle weitere aktivierte Sub-Routen.
		do {
			// Ist dies aktuell iterierte Route die letzte aktivierte Komponentenroute?
			if (activatedRoute.children.length == 0) {
				// Ja, also speichere die Komponente in einer lokalen Variable.
				let component: string | Type<any> = activatedRoute.component;

				// Wurde ein Komponententyp abgerufen?
				if (typeof (component) !== 'string') {
					// Ja, also rufe dessen Klassennamen ab und speichere diesen stattdessen.
					component = component.name;
				}

				// Gib nun den Komponentennamen zurück.
				return <string>component;
			}
			// Nein, aktiviert die aktuell iterierte Route mehr als eine weitere Komponente?
			else if (activatedRoute.children.length > 1) {
				// Ja, also können wir keine Komponente eindeutig bestimmen. Gib deshalb den `null` Wert zurück.
				return null;
			}

			// Die aktuell iterierte Route aktiviert genau eine weitere Komponentenroute, iteriere über diese als
			// nächstes.
			activatedRoute = activatedRoute.firstChild;
		}
		// Iteriere solang wir eine aktivierte Route haben.
		while (activatedRoute);

		// Wir konnten keine eindeutig aktivierte Komponente ermitteln, gib deshalb den `null` Wert zurück.
		return null;
	}

	public get activeNavItem(): INavbarItem {
		// Ermittle die Komponente der aktivierten Route.
		switch (this.getRouteComponentName()) {
			case 'DashboardComponent':
				return StartseiteItem;

			case 'ProjectsComponent':
				return ProjekteItem;

			case 'GeschaeftsstellenComponent':
				return GeschStellenItem;

			default:
				return null;
		}
	}

	public LoadProjekt(guidauftrag: string): Promise<EProjektDTO> {
    return null;
		// return this.projekteService.apiV1EProjekteGuidGet(guidauftrag).pipe(map(
		// 	(data) => {
		// 		return data
		// 	}),
		// 	catchError(e => {
		// 		console.error(e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EProjektDTO>
	}

	public LoadAktion(aktion_guid: string): Promise<EAktionDTO> {
    return null;
		// return this.aktionenService.apiV1EAktionenGuidGet(aktion_guid).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen der Aktion', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EAktionDTO>
	}

	public SaveAktion(aktion: EAktionDTO): Promise<EAktionDTO> {
    return null;
		// return this.aktionenService.apiV1EAktionenPost(aktion).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Einfügen der Aktion')
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EAktionDTO>
	}

	public LoadFormular(guid: string): Promise<EFormularDTO> {
    return null;
		// return this.formulareService.apiV1EFormulareGuidGet(guid).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen des Formulars', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularDTO>
	}

	public SaveFormular(guid: string, formularTypGuid: string): Promise<EFormularDTO> {
    return null;
		// const data: EFormularDTO = {
		// 	mandant: this.CurIdentity.mandant,
		// 	guid: guid,
		// 	formularTyp: {
		// 		guid: formularTypGuid,
		// 	},
		// 	fortschritt: 100
		// }
		// return this.formulareService.apiV1EFormularePost(data).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Speichern des Formulars', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularDTO>
	}

	public LoadPDF(guid: string): Promise<Blob> {
    return null;
		// return this.dokumenteService.apiV1EDokumenteGuidObjectGet(guid).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Laden des Datei-Dokuments', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<Blob>
	}

	public SavePDF(guid: string, file: File): Promise<any> {
    return null;
		// const extension = file.name.split('.').pop();
		// let dokumentTypGuid = ''
		// if (extension === 'pdf') {
		// 	dokumentTypGuid = DokumentTypGuids.pdf
		// } else if (extension === 'jpg' || extension === 'jpeg') {
		// 	dokumentTypGuid = DokumentTypGuids.jpg
		// } else if (extension === 'png') {
		// 	dokumentTypGuid = DokumentTypGuids.png
		// } else if (extension === 'svg') {
		// 	dokumentTypGuid = DokumentTypGuids.svg
		// }
		// if (!dokumentTypGuid) {
		// 	console.error(`Dokument-Typ ${extension} nicht unterstützt!`)
		// 	return
		// }

		// return this.dokumenteService.apiV1EDokumenteGuidObjectPost(
		// 	guid,
		// 	file,
		// 	dokumentTypGuid,
		// 	true
		// ).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Speichern des Dokuments', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<any>
	}



	public SavePDFAttachment(formular: EFormularDTO, formularTyp: string): Promise<any> {
    return null;
		// if (!formularTyp)
		// 	formularTyp = guid_attachment;


		// const existing = formular.formularDokumentPool?.find(b => b.formularBeilage?.formularTyp.guid === formularTyp)
		// if (existing && existing.formularBeilage) {
		// 	if (!confirm(`Vorhandene Beilage "${existing.formularBeilage.dokument.originalName}" ersetzen ?`)) {
		// 		return
		// 	}
		// }
		// const guid = existing && existing.formularBeilage ? existing.formularBeilage.guid : null

		// const beilage: EFormularBeilageDTO = {
		// 	mandant: formular.mandant,
		// 	formular: formular.guid,
		// 	guid: guid,
		// 	formularTyp: {
		// 		guid: formularTyp,
		// 	},
		// }

		// return this.formulareService.apiV1EFormulareAttachmentsPost(
		// 	beilage
		// ).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Speichern des Attachments', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<any>
	}

	public DeletePDFAttachment(guid: string): Promise<any> {
    return null;
		// return this.formulareService.apiV1EFormulareAttachmentsGuidDelete(
		// 	guid
		// ).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Löschen des Attachments', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<any>
	}



	async SavePDF_as_Formular(file: File, dokumentGuid: string, aktionGuid: string, formularTypGuid: string): Promise<any> {
		let formular: EFormularDTO
		if (dokumentGuid) {
			formular = await this.LoadFormular(dokumentGuid)
		} else {
			formular = await this.SaveFormular(null, formularTypGuid)
			const aktion = await this.LoadAktion(aktionGuid)
			aktion.dokument = formular
			await this.SaveAktion(aktion)
		}
		if (formular.dokument.originalName) {
			if (!confirm(`Vorhandenes Dokument "${formular.dokument.originalName}" ersetzen ?`)) {
				return
			}

		}

		await this.SavePDF(formular.dokument.guid, file)
	}

	async SavePDF_as_Beilage(file: File, auftragsGuid: string, dokumentGuid: string, formularTypGuid: string): Promise<any> {
		if (dokumentGuid) {
			const formular = await this.LoadFormular(dokumentGuid)
			const doc = await this.SavePDFAttachment(formular, formularTypGuid);
			await this.SavePDF(doc.dokument.guid, file);

			const dokumentPool: EAuftragDokumentPoolDTO = {
				guidAuftrag: auftragsGuid,
				guidBeilage: doc.guid
			}
			await this.Save_Dokument_Pool(dokumentPool)

			const formularDokumentPool: EFormularDokumentPoolDTO = {
				guidFormular: formular.guid,
				guidFormularBeilagen: doc.guid
			}

			await this.Insert_Remove_FormularDokumentPool(true, formularDokumentPool)

		}
	}

	get_PoolBeilage_FromTyp(projekt: EProjektDTO, guidBeilageTyp: string): string | null {
		if (projekt && projekt.auftrag && projekt.auftrag.dokumente) {
			const poolbeilage = projekt.auftrag.dokumente.find(d => {
				if (d.eformularBeilagen_IdFormularBeilagen && d.eformularBeilagen_IdFormularBeilagen.formularTyp) {
					return d.eformularBeilagen_IdFormularBeilagen.formularTyp.guid === guidBeilageTyp
				}
        return null;
			})
			if (poolbeilage) {
				return poolbeilage.eformularBeilagen_IdFormularBeilagen.guid
			}
		}
		return null
	}

	Insert_Remove_FormularDokumentPool(insert: boolean, formularDokumentPool: EFormularDokumentPoolDTO): Promise<EFormularDokumentPoolDTO> {
    return null;
    // if (insert) {
		// 	return this.auftraegeService.apiV1EAuftraegeFormularpoolPost(formularDokumentPool).pipe(map(
		// 		(data) => {
		// 			this.emitLinkBeilage(data)
		// 			return data;
		// 		}),
		// 		catchError(e => {
		// 			console.error('Fehler beim Einfügen in den Formular-Dokumenten-Pool', e);
		// 			return throwError(e);
		// 		})).toPromise() as Promise<EFormularDokumentPoolDTO>
		// } else {
		// 	return this.auftraegeService.apiV1EAuftraegeFormularpoolDelete(formularDokumentPool.guidFormular, formularDokumentPool.guidFormularBeilagen).pipe(map(
		// 		(data) => {
		// 			this.emitLinkBeilage(data)
		// 			return data;
		// 		}),
		// 		catchError(e => {
		// 			console.error('Fehler beim Entfernen aus dem Formular-Dokumenten-Pool', e);
		// 			return throwError(e);
		// 		})).toPromise() as Promise<EFormularDokumentPoolDTO>

		// }
	}

	async SavePDF_as_PoolBeilage(auftrag: EAuftragDTO, file: File, guidFormularTyp: string, guidBeilage: string): Promise<any> {
    return null;
		// return new Promise((resolve, reject) => {
		// 	const beilage: EFormularBeilageDTO = {
		// 		mandant: auftrag.mandant,
		// 		guid: guidBeilage ? guidBeilage : null,
		// 		formularTyp: {
		// 			guid: guidFormularTyp,
		// 		},
		// 	}
		// 	try {
		// 		this.formulareService.apiV1EFormulareAttachmentsPost(beilage).subscribe(async data => {
		// 			if (!guidBeilage) {
		// 				await this.SavePDF(data.dokument.guid, file)
		// 			}
		// 			beilage.guid = data.guid
		// 			beilage.dokument = data.dokument
		// 			const dokumentPool: EAuftragDokumentPoolDTO = {
		// 				mandant: auftrag.mandant,
		// 				guidAuftrag: auftrag.guid,
		// 				guidBeilage: data.guid
		// 			}
		// 			await this.Save_Dokument_Pool(dokumentPool)
		// 			resolve('')
		// 		})
		// 	} catch (error) {
		// 		console.error('Fehler beim Speichern der Pool-Beilage', error);
		// 		reject(error)
		// 	}
		// })

	}

	public Save_Dokument_Pool(dokumentPool: EAuftragDokumentPoolDTO): Promise<EAuftragDokumentPoolDTO> {
    return null;
		// return this.auftraegeService.apiV1EAuftraegeDokumentenpoolPost(dokumentPool).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Einfügen in den Dokumenten-Pool', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EAuftragDokumentPoolDTO>

	}

	public Delete_Dokument_Pool_Beilage(beilage_guid: string, projekt: EProjektDTO): Promise<EAuftragDokumentPoolDTO> {
    return null;
		// return this.auftraegeService.apiV1EAuftraegeDokumentenpoolBeilageGuidDelete(beilage_guid).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		const linked = projekt.auftrag.dokumente.map(d => d.eformularBeilagen_IdFormularBeilagen).filter(b => b.guid === beilage_guid)
		// 		if (linked.length > 0) {
		// 			const msg ='comp_project_detail.msg_linked'))
		// 			alert(msg)
		// 			return
		// 		}
		// 		console.error('Fehler beim Löschen aus dem Dokumenten-Pool', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EAuftragDokumentPoolDTO>

	}


	public GetCurrentMitarbeiter(): Promise<MitarbeiterDTO> {
    return null;
		// return this.mitarbeiterService.apiV1MitarbeiterQueryGet(this.CurIdentity.mandant, this.CurIdentity.mitarbeiter).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen des Mitarbeiters', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<MitarbeiterDTO>
	}

	public GetCurrentGeschStelle(): Promise<GeschStelleDTO> {
    return null;
		// return this.geschStellenService.apiV1GeschStellenGuidGet(this.CurIdentity.geschaeftsstelle).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen des Mitarbeiters', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<GeschStelleDTO>
	}

	public GetAdressse(guid: string): Promise<AdresseDTO> {
    return null;
		// return this.adressenService.apiV1AdressenGuidGet(guid).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen der Adresse', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<AdresseDTO>
	}

	public ValidateFormular(receiver: string, formular: EFormularDTO): Promise<EFormularDTO> {
    return null;
		// return this.formulareService.apiV1EFormulareValidatePost(receiver, formular).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Validieren des Formulares', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularDTO>
	}

	public SendFormular(receiver: string, formular: EFormularDTO): Promise<EFormularDTO> {
    return null;
		// return this.formulareService.apiV1EFormulareSendPost(receiver, formular).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Senden des Formulares', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularDTO>
	}

	public SaveFormularBeilage(beilage: EFormularBeilageDTO): Promise<EFormularBeilageDTO> {
    return null;
		// return this.formulareService.apiV1EFormulareAttachmentsPost(beilage).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Senden des Formulares', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularBeilageDTO>
	}

	public SaveGrundbuchauszugBeilage(beilage: EFormularBeilageDTO, fileName: string, egrid: string, bfsNr: number, parcelNr: number, gebNr: number): Promise<EFormularBeilageDTO> {
    return null;
		// return this.formulareService.apiV1EFormulareAttachmentsParcelPost(fileName, parcelNr, bfsNr, egrid, beilage).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Senden des Formulares', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EFormularBeilageDTO>
	}

	public SaveGeraete(gebaeude: GebaeudeDTO): Promise<void> {
    return null;
		// return this.gebaeudeService.apiV1GebaeudeGeraetePut(gebaeude).pipe(map(
		// 	() => {
		// 		return
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Einfügen der Geräte')
		// 		return throwError(e);
		// 	})).toPromise() as Promise<void>
	}

	public LoadEmpfaenger = (plz: string): Promise<EmpfaengerDTO[]> => {
    return null;
		// return this.empfaengerService.apiV1EmpfaengerPlzGet(plz).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen der Empfänger', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<EmpfaengerDTO[]>
	}

	public GetEmpfaenger = (projekt: EProjektDTO, formularguid: string): Promise<EmpfaengerDTO> => {
    return null;
		// let empfaengerguid: string = ''
		// projekt?.auftrag?.phasen.forEach(p => p.leistungen.forEach(l => l.aktionen.forEach(a => {
		// 	if (a.dokument?.guid === formularguid) {
		// 		empfaengerguid = l.empfaenger
		// 	}
		// })))
		// if (empfaengerguid) {
		// 	return this.empfaengerService.apiV1EmpfaengerGuidGet(empfaengerguid).pipe(map(
		// 		(data) => {
		// 			return data;
		// 		}),
		// 		catchError(e => {
		// 			console.error('Fehler bei der Abfragen Empfänger', e);
		// 			return throwError(e);
		// 		})).toPromise() as Promise<EmpfaengerDTO>
		// }
	}

	public GetAnlage = (projekt: EProjektDTO, formularguid: string): EAnlageDTO => {
    return null;
		// let anlageguid: string = ''
		// let anlage: EAnlageDTO
		// projekt?.auftrag?.phasen.forEach(p => p.leistungen.forEach(l => l.aktionen.forEach(a => {
		// 	if (a.dokument?.guid === formularguid) {
		// 		anlageguid = l.anlage
		// 	}
		// })))
		// if (anlageguid) {
		// 	projekt?.gebaeude?.anlagen?.forEach(a => {
		// 		if (a.guid === anlageguid) {
		// 			anlage = a
		// 		}
		// 	})

		// }
		// return anlage
	}


	public LoadPLZ = (plz: string): Promise<PostleitzahlenDTO[]> => {
    return null;
		// return this.plzService.apiV1PostleitzahlenPlzGet(plz).pipe(map(
		// 	(data) => {
		// 		return data;
		// 	}),
		// 	catchError(e => {
		// 		console.error('Fehler beim Abfragen PLZ', e);
		// 		return throwError(e);
		// 	})).toPromise() as Promise<PostleitzahlenDTO[]>
	}

	public geoApiStrasse = (suchtext: string): Promise<any[]> => {
		return this.http.get(`https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.amtliches-strassenverzeichnis&searchText=${suchtext}&searchField=label&returnGeometry=false`).pipe(map(
			(data: any) => {
				return data.results;
			}),
			catchError(e => {
				console.error('Fehler beim Abfrage api3.geo.admin.ch', e);
				return throwError(e);
			})).toPromise() as Promise<any[]>
	}

	public kompoDBApi = (): Promise<any[]> => {
		return this.http.get(`https://a12aed51-772b-47db-ab86-2fd6028fa855.mock.pstmn.io/component/?component_type=pv_panel&name=TSM`).pipe(map(
			(data: any) => {
				return data.results;
			}),
			catchError(e => {
				console.error('Fehler bei Abfrage Komponenten Datenbank', e);
				return throwError(e);
			})).toPromise() as Promise<any[]>
	}

	public kompoDBModulApi = (type: string, component_id: string): Promise<any> => {
		// https://a12aed51-772b-47db-ab86-2fd6028fa855.mock.pstmn.io/products/pv_modules/c72ea53a-d440-11eb-b8bc-0242ac130003/details
		// https://a12aed51-772b-47db-ab86-2fd6028fa855.mock.pstmn.io/products/inverters/76bbce85-df92-4e39-bf7e-7778674e7bd6/details
		// https://a12aed51-772b-47db-ab86-2fd6028fa855.mock.pstmn.io/products/storage/d4966a16-a892-4c6d-ba0f-485ca806d1e6/details

		return this.http.get(`https://a12aed51-772b-47db-ab86-2fd6028fa855.mock.pstmn.io/products/${type}/${component_id}/details`).pipe(map(
			(data: any) => {
				return data;
			}),
			catchError(e => {
				console.error('Fehler bei Abfrage Komponenten Modul Datenbank', e);
				return throwError(e);
			})).toPromise() as Promise<any[]>
	}


}