/**
 * Next-Gen App API
 * Die REST Web-Schnittstelle zu der Next-Gen App Anwendung
 *
 * The version of the OpenAPI document: v1
 * Contact: info@brunnerinformatik.ch
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { EDokumentWertDTO } from './eDokumentWertDTO';
import { EDokumentAttributDTO } from './eDokumentAttributDTO';
import { EDokumentTypDTO } from './eDokumentTypDTO';


/**
 * Diese Klasse reprÃ¤sentiert ein Data-Transfer-Object fÃ¼r eine Dokument-EntitÃ¤t der Elektro-Sparte.
 */
export interface EDokumentDTO { 
    /**
     * Die <see cref=\"T:System.Guid\">GUID</see> des Mandanten zu welchem dieses Dokument gehÃ¶rt.
     */
    mandant?: string;
    /**
     * Die eindeutige <see cref=\"T:System.Guid\">GUID</see> dieses Dokuments innerhalb des Mandanten.
     */
    guid?: string | null;
    documentType?: EDokumentTypDTO;
    /**
     * Der originale Dateiname des Dokumentobjektes, sofern vorhanden.
     */
    originalName?: string | null;
    /**
     * Die GrÃ¶sse des im Datenspeicher gespeicherten Dokumentes in Bytes.
     */
    size?: number;
    /**
     * Der SHA-512 Hashwert des im Datenspeicher gespeicherten Dokumentes.
     */
    hash?: string | null;
    /**
     * Eine Sammlung aller Dokument Attribut Definitionen fÃ¼r die Werte in der `Werte` Eigenschaft.
     */
    attribute?: Array<EDokumentAttributDTO> | null;
    /**
     * Eine Sammlung aller Dokument Attribut Werte. Die Attribut Definitionen werden in der `Attribute` Eigenschaft  geliefert.
     */
    werte?: Array<EDokumentWertDTO> | null;
}

