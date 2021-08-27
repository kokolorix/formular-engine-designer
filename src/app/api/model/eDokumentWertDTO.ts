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


/**
 * Diese Klasse reprÃ¤sentiert ein Data-Transfer-Object eines Dokumentwertes fÃ¼r Dokumente aus der Elektro Sparte.
 */
export interface EDokumentWertDTO { 
    /**
     * Die GUID des Dokumentattributes welches diesen Wert beschreibt.
     */
    attribut: string;
    /**
     * Der Index des Wertes fÃ¼r Mehrzeilige Werte oder Feldwerte.
     */
    index?: number;
    /**
     * Der Wert oder die Daten des Dokumentattributes.
     */
    daten?: string | null;
}

