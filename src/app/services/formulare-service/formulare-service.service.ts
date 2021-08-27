import { Injectable } from '@angular/core';
import { Guid } from 'src/app/tools/Guid';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, first, map, timeout } from 'rxjs/operators';
import { EFormularDTO } from 'src/app/api';
import { FormularFieldSet, IFormularFieldSet } from './FormularFieldSet';
import * as Utilities from "./FormularUtils";
import { asGuid } from "./FormularUtils";
import { EventProperty, IEventProperty } from 'src/app/tools/EventProperty';
import { FormularBase, FormularState, IFormularBase } from './FormularBase';
import { Formular, IFormular } from './Formular';
import { IFormularHeaderData } from './FormularHeader';

import * as schemas from '../../schemas/index';

/**
 * Diese Konstante aktiviert oder deaktiviert die Ausgabe von Ablaufverfolgungsmeldungen der `FormularService` Klasse
 * in der Browser Konsole.
 */
const TRACE_FORMULARE_SERVICE: boolean = true;

/**
 * Diese Konstante aktiviert oder deaktiviert die Ausgabe von Debug-Meldungen der `FormularService` Klasse in der
 * Browser Konsole.
 */
const DEBUG_FORMULARE_SERVICE: boolean = true;

/**
 * Diese Methode gibt eine Ablaufverfolgungsmeldung in der Browser Konsole aus, sofern diese Ausgabe mittels der
 * `TRACE_FORMULARE_SERVICE` Konstanten aktiviert wurde und die Anwendung nicht in der Produktiven Umgebung ausgeführt
 * wird.
 *
 * @param identifier
 * 	Der Name/Identifikator des Ablaufs.
 *
 * @param mode
 * 	Der Modus der Ablaufverfolgungsmeldung: `true` => Der Ablauf hat begonnen. `false` => Der Ablauf ist
 * 	abgeschlossen. `null` oder `undefined` => Allgemeine Ablaufverfolgungsmeldung.
 *
 * @param optionalParams
 * 	Zusätzliche Werte die Protokolliert werden sollen.
 */
function log_trace(identifier: string, mode?: boolean, ...optionalParams: any[])
{
	// Prüfe ob die TRACE-Option aktiviert wurde und gib die Ablaufverfolgungsmeldung dementsprechend aus.
	if(true === TRACE_FORMULARE_SERVICE) Utilities.log_trace(identifier, mode, ...optionalParams);
}

/**
 * Diese Methode gibt eine 'DEBUG'-Meldung in der Browser Konsole aus, sofern diese Ausgabe mittels der
 * `DEBUG_FORMULARE_SERVICE` Konstanten aktiviert wurde und die Anwendung nicht in der Produktiven Umgebung ausgeführt
 * wird.
 *
 * @param message
 * 	Die auszugebende Meldung.
 *
 * @param optionalParams
 * 	Zusätzliche Werte die Protokolliert werden sollen.
 */
function log_debug(message: any, ...optionalParams: any[])
{
	// Prüfe ob die DEBUG-Option aktiviert wurde und gib die 'DEBUG'-Meldung dementsprechend aus.
	if(true === DEBUG_FORMULARE_SERVICE) Utilities.log_debug(message, ...optionalParams);
}

/**
 * Dieser Aufzählungstyp definiert alle gültigen Zustände, welche der Formulare Service haben kann.
 */
export enum FormularServiceState
{
	/**
	 * Der Formular-Service ist bereit für interaktionen.
	 */
	Ready = 0,

	/**
	 * Der Formular-Service lädt aktuell ein Formular.
	 */
	Loading = 1,

	/**
	 * Der Formular-Service speichert aktuell aktuell ein Formular.
	 */
	Saving = 2,

	/**
	 * Der Formular-Service entlädt aktuell ein Formular.
	 */
	Unloading = 3,

	/**
	 * Der Formular-Service hat ein Problem/Fehler festgestellt!
	 */
	Error = 4
}

export interface IFormulareAPI
{

}

export interface IFormularChangedEvent {
	(eventData: IFormularChangedEventData): void;
};

export interface IFormularChangedEventData {
	formular: IFormularBase,
	value: IFormularFieldSet
};

export interface IFormularLoadingEvent {
	(eventData: IFormularLoadingEventData): void;
};

export interface IFormularLoadingEventData {
	formular: EFormularDTO;
	isNew: boolean;
};

export interface IFormularLoadedEvent {
	(eventData: IFormularLoadedEventData): void;
};

export interface IFormularLoadedEventData {
	formular: IFormular;
	isNew: boolean;
};

export interface IFormularSavingEvent {
	(eventData: IFormularSavingEventData): void;
};

export interface IFormularSavingEventData {
	formular: IFormular;
};

export interface IFormularSavedEvent {
	(eventData: IFormularSavedEventData): void;
};

export interface IFormularSavedEventData {
	formular: IFormular;
};

export interface IFormularUnloadingEvent {
	(eventData: IFormularUnloadingEventData): void;
};

export interface IFormularUnloadingEventData {
	formular: IFormular;
};

export interface IFormularUnloadedEvent {
	(eventData: IFormularUnloadedEventData): void;
};

export interface IFormularUnloadedEventData {
	formular: IFormular;
};

/**
 * Diese Klasse stellt alle notwendigen Funktionen und Informationen zur sinnvollen Interaktion mit Formularen bereit.
 */
@Injectable({
	providedIn: 'root'
})
export class FormulareService implements IFormulareAPI
{
	//#region Private Felder.

	/**
	 * Dieses `BehaviorSubject` Instanz speichert den aktuellen Zustand dieser Formular Service Instanz. Setze den
	 * initialen Zustand des Formular-Service auf `bereit`.
	 */
	private readonly _state$: BehaviorSubject<FormularServiceState> =
		new BehaviorSubject<FormularServiceState>(FormularServiceState.Ready);

	/**
	 * Dieses Feld speichert das aktuell geladene Formular als `Formular`-Instanz.
	 */
	private _formular: Formular = null;

	/**
	 * Diese `BehaviorSubject` Instanz speichert die aktuelle `IFormularHeaderData ` Instanz und benachrichtigt alle
	 * Observatoren bei einer Änderung.
	 */
	private readonly _formularHeader$: BehaviorSubject<IFormularHeaderData> =
		new BehaviorSubject<IFormularHeaderData>( {
			title: '',
			code: '',
			progress: 0,
			continuousProgress: false,
			statusProgress: false,
			statusText: '',
			canDownload: false,
			isDownloading: false,
			canSave: false,
			isSaving: false,
			canSend: false,
			isSending: false
		});

	private readonly _formularChanged$: Subject<{ formular: FormularBase, value: FormularFieldSet }> =
		new Subject<{ formular: FormularBase, value: FormularFieldSet }>();

	private readonly _onChanged: EventProperty<IFormularChangedEvent> = new EventProperty<IFormularChangedEvent>();

	private readonly _onLoading: EventProperty<IFormularLoadingEvent> = new EventProperty<IFormularLoadingEvent>();
	private readonly _onLoaded: EventProperty<IFormularLoadedEvent> = new EventProperty<IFormularLoadedEvent>();

	private readonly _onSaving: EventProperty<IFormularSavingEvent> = new EventProperty<IFormularSavingEvent>();
	private readonly _onSaved: EventProperty<IFormularSavedEvent> = new EventProperty<IFormularSavedEvent>();

	private readonly _onUnloading: EventProperty<IFormularUnloadingEvent> = new EventProperty<IFormularUnloadingEvent>();
	private readonly _onUnloaded: EventProperty<IFormularUnloadedEvent> = new EventProperty<IFormularUnloadedEvent>();

	private _error: any;

	//#endregion

	constructor(
		// private readonly _formulareService: EFormulareService
	)
	{
		this._state$.subscribe(
			(state) => {
				let headerData: IFormularHeaderData = this._formularHeader$.value;

				switch(state)
				{
					case FormularServiceState.Loading:
					case FormularServiceState.Unloading:
						headerData.canDownload = false;
						headerData.isDownloading = false;

						headerData.canSave = false;
						headerData.isSaving = false;

						headerData.canSend = false;
						headerData.isSending = false;

						break;

					case FormularServiceState.Ready:
						if(this._formular)
						{
							headerData.canDownload = true;
							headerData.isDownloading = false;

							headerData.canSave = this._formular?.state !== FormularState.Unchanged;
							headerData.isSaving = false;

							headerData.canSend = true;
							headerData.isSending = false;
						}
						else
						{
							headerData.canDownload = false;
							headerData.isDownloading = false;

							headerData.canSave = false;
							headerData.isSaving = false;

							headerData.canSend = false;
							headerData.isSending = false;
						}

						break;

					case FormularServiceState.Saving:
						headerData.canDownload = false;
						headerData.isDownloading = false;

						headerData.canSave = false;
						headerData.isSaving = true;

						headerData.canSend = false;
						headerData.isSending = false;

						break;
				}

				this._formularHeader$.next(headerData);

				return;
			}
		);

		this._formularChanged$.subscribe(
			(data: { formular: FormularBase, value: FormularFieldSet }) =>
			{
				this.onChanged(data.formular, data.value);
			}
		);
	}

	//#region Private Methoden.

	private onFormularLoad(formularDto: EFormularDTO, isNew: boolean): void
	{
		this.onBeforeLoad(formularDto, isNew);

		this._formular =
			new Formular(
				formularDto,
				isNew,
				this._formularChanged$,
				FormularState.Unchanged
			);

		this.onAfterLoad(this._formular, isNew);

		return;
	}

	private onBeforeLoad(formularDto: EFormularDTO, isNew: boolean): void
	{
		for(let callback of this._onLoading.callbacks)
		{
			try
			{
				callback({ formular: formularDto, isNew: isNew });
			}
			catch(error)
			{
				console.error(
					'FormularService::BeforeLoad callback error!',
					callback,
					error
				);
			}
		}

		return;
	}

	private onAfterLoad(formular: Formular, isNew: boolean): void
	{
		for(let callback of this._onLoaded.callbacks)
		{
			try
			{
				callback({ formular: formular, isNew: isNew });
			}
			catch(error)
			{
				console.error(
					'FormularService::AfterLoad callback error!',
					{
						instance: this,
						callback: callback,
						error: error
					}
				);
			}
		}

		return;
	}

	private onBeforeSave(formular: Formular): void
	{
		for(let callback of this._onSaving.callbacks)
		{
			try
			{
				callback({ formular: formular });
			}
			catch(error)
			{
				console.error(
					'FormularService::BeforeSave callback error!',
					callback,
					error
				);
			}
		}

		return;
	}

	private onAfterSave(formular: Formular): void
	{
		for(let callback of this._onSaved.callbacks)
		{
			try
			{
				callback({ formular: formular });
			}
			catch(error)
			{
				console.error(
					'FormularService::AfterSave callback error!',
					callback,
					error
				);
			}
		}

		return;
	}

	private onBeforeUnload(formular: Formular): void
	{
		for(let callback of this._onUnloading.callbacks)
		{
			try
			{
				callback({ formular: formular });
			}
			catch(error)
			{
				console.error(
					'FormularService::BeforeUnload callback error!',
					callback,
					error
				);
			}
		}

		return;
	}

	private onAfterUnload(formular: Formular): void
	{
		for(let callback of this._onUnloaded.callbacks)
		{
			try
			{
				callback({ formular: formular });
			}
			catch(error)
			{
				console.error(
					'FormularService::AfterUnload callback error!',
					callback,
					error
				);
			}
		}

		return;
	}

	private onChanged(formular: FormularBase, value: FormularFieldSet): void
	{
		// Ablaufverfolgung: Logge den Beginn der Ausführung dieser Methode.
		log_trace('FormularService::onChanged', true, { formular: formular, value: value });

		// Iteriere nun über alle registrierten Callback Funktionen.
		for(let callback of this._onChanged.callbacks)
		{
			try
			{
				// Rufe die aktuell iterierte Callback Funktion nun auf.
				callback({ formular: formular, value: value });
			}
			catch(error)
			{
				// Es ist ein Fehler in der Callback Funktion aufgetreten, protokolliere diesen Fehler in der Browser
				// Konsole.
				console.error(
					'FormularService::changed callback error!',
					{
						callback: callback,
						error: error
					}
				);
			}
		}

		// TODO: Move to separate function!
		let fh: IFormularHeaderData = this.formularHeader;

		fh.canSave = formular.state != FormularState.Unchanged;
		fh.statusText = `${formular.state}`;

		this.formularHeader = fh;

		// Ablaufverfolgung: Logge das Ende der Ausführung dieser Methode.
		log_trace('FormularService::onChanged', false);

		// Alles erledigt, kehre nun zurück.
		return;
	}

	private setError(error: any): void
	{
		this._error = error;
		this._state$.next(FormularServiceState.Error);

		return;
	}

	//#endregion

	//#region Öffentliche Methoden.

	public async awaitReady(maxTime: number = 30000): Promise<void> {
		return this._state$.pipe(
			filter((state) => state === FormularServiceState.Ready),
			timeout(maxTime),
			first()
		).toPromise().then((t) => { return; })
	}

	public async loadFormularAsync(
		formular: string | Guid | EFormularDTO,
		isNew: boolean = null,
		timeout: number = 30000
	): Promise<void>
	{
		await this.awaitReady(timeout);

		this.loadFormular(formular, isNew);

		await this.awaitReady(timeout);

		return;
	}

	public loadFormular(formular: string | Guid | EFormularDTO, isNew: boolean = null): void
	{

	}

	public async unloadFormularAsync(force: boolean = false, timeout: number = 30000): Promise<void>
	{
		await this.awaitReady(timeout);

		this.unloadFormular(force);

		await this.awaitReady(timeout);

		return;
	}

	public unloadFormular(force: boolean = false): void
	{
		// Prüfe ob der Formular-Service bereit ist, ein geladenes Formular zu entladen.
		if(this._state$.value !== FormularServiceState.Ready) {
			// Der Formular-Service ist nicht bereit, wirf eine Ausnahme!
			throw new Error(
				"This Formular-Service instance is not ready to unload the currently loaded formular!"
			);
		}

		// Prüfe ob wir aktuell ein Formular geladen haben.
		if(this._formular == null) {
			// Nein, also kehre direkt zurück.
			return;
		}

		// Hat das aktuell geladene Formular Änderungen welche noch nicht gesichert wurden? Falls ja, prüfe ob wir die
		// Änderungen verwerfen sollen.
		if(this._formular.state !== FormularState.Unchanged && force === true) {
			// Das Formular hat ungesicherte Änderungen welche nicht verworfen werden sollen, wirf deshalb eine Ausnahme!
			throw new Error(
				"The currently loaded Formular has unsaved changes and force unloading was not specified!"
			);
		}

		// Der Formular-Service ist bereit, aktualisiere nun den Zustand.
		this._state$.next(FormularServiceState.Unloading);

		// Speichere nun die Referenz des aktuell geladenen Formulars in einer lokalen Variable.
		const formular: Formular = this._formular;


		// Rufe alle Event-Handler des 'bevor entladen' Events auf.
		this.onBeforeUnload(formular);

		// Lösche nun die intern gespeicherte Formular-Instanz.
		this._formular = null;

		// Und nun rufe alle Event-Handler des 'nach dem Entladen' Events auf.
		this.onAfterUnload(formular);

		// Das Formular wurde entladen, aktualisiere den Zustand.
		this._state$.next(FormularServiceState.Ready);

		// Kehre nun zurück.
		return;
	}

	public async saveFormularAsync(timeout: number = 30000): Promise<void>
	{
		await this.awaitReady(timeout);

		this.saveFormular();

		await this.awaitReady(timeout);

		return;
	}

	public saveFormular()
	{

	}

	//#endregion

	//#region Öffentliche Eigenschaften.

	public get beforeLoaded(): IEventProperty<IFormularLoadingEvent>
	{
		return this._onLoading;
	}

	public get afterLoaded(): IEventProperty<IFormularLoadedEvent>
	{
		return this._onLoaded;
	}

	public get beforeSaving(): IEventProperty<IFormularSavingEvent>
	{
		return this._onSaving;
	}

	public get afterSaving(): IEventProperty<IFormularSavedEvent>
	{
		return this._onSaved;
	}

	public get afterChanged(): IEventProperty<IFormularChangedEvent>
	{
		return this._onChanged;
	}

	public get beforeUnloading(): IEventProperty<IFormularUnloadingEvent>
	{
		return this._onUnloading;
	}

	public get afterUnloaded(): IEventProperty<IFormularUnloadedEvent>
	{
		return this._onUnloaded;
	}

	/**
	 * Diese Eigenschaft ruft den aktuellen Zustand dieser Formular Service Instanz ab.
	 */
	public get state(): FormularServiceState
	{
		// Gib den intern gespeicherten aktuellen Zustand dieser Formular Service Instanz zurück.
		return this._state$.value;
	}

	public get formular(): IFormular {
		return this._formular;
	}

	/**
	 * Diese Eigenschaft ruft eine Kopie der aktuellen `IFormularHeaderData` Instanz ab, welche die Daten für die
	 * Formular Header Komponente bereitstellt.
	 */
	public get formularHeader(): IFormularHeaderData {
		// Gib eine Kopie der aktuelle intern gespeicherte Formular Header Dateninstanz zurück.
		return Object.assign({ }, this._formularHeader$.value);
	}

	/**
	 * Diese Eigenschaft speichert eine Kopie der spezifizierten `IFormularHeaderData` Instanz ab, welche die Daten für
	 * die Formular Header Komponente bereitstellt und benachrichtigt alle entsprechenden Observatoren.
	 */
	public set formularHeader(formularHeader: IFormularHeaderData) {
		// Speichere eine Kopie der spezifizierten Formular Header Dateninstanz interna ab und benachrichtige alle
		// Observatoren über die Änderung.
		this._formularHeader$.next(Object.assign({ }, formularHeader))

		// Wir sind fertig, kehre nun zurück.
		return;
	}

	/**
	 * Diese Eigenschaft ruft die observierbare `IFormularHeaderData` Instanz ab, welche die Daten für die Formular
	 * Header Komponente bereitstellt.
	 */
	public get formularHeaderObservable(): Observable<IFormularHeaderData> {
		// Gib einen neuen Observer zurück, welcher eine Kopie der effektiven Formular Header Dateninstanz zurückgibt.
		return this._formularHeader$.pipe(map((d) => Object.assign({ }, d)));
	}

	//#endregion
}
