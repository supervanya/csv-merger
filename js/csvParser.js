/**
 * The heavy lifting is done here
 *
 * @param {string} vaultCSV
 * @param {string} gmcCSV
 * @returns {string}
 */
export function combineCSV(vaultCSV, gmcCSV) {
  // this helps to have the same column name
  const shortenSerialNumberHeader = (header) =>
    header === "serialNumber" || header === "serial_number" ? "sn" : header;

  /**
   * This function converts comma separated string -> JS Object. example:
   *
   * {
   *   pallet_out_name: "Clarenceville_001",
   *   box_out_name: "860-CBK-004",
   *   sn: "DN1J0H3",
   *   assigned_asset_tag: "CLV-ECF-0089",
   * }
   *
   * Notice how serial_number became sn because of `shortenSerialNumberHeader`
   */
  const parseFile = (csvFileString) =>
    Papa.parse(csvFileString, {
      header: true,
      transformHeader: shortenSerialNumberHeader,
    });

  const vaultData = parseFile(vaultCSV).data;
  const gmcData = parseFile(gmcCSV).data;

  const combinedData = vaultData.map((vaultRow) => {
    // 1. So basically I think flow wise, I'd map the gmc object to the vault object based on serial number as a key.
    const gmcRow = gmcData.find((gmcRow) => gmcRow.sn === vaultRow.sn);

    // 2. I would then need to compare the GMC asset tag against
    // the vault asset tag and write a note if it doesn't match
    // TODO(@Nyrvous): it would be good to add a helpful note here
    let note;
    if (gmcRow.annotatedAssetId !== vaultRow.assigned_asset_tag) {
      note = `Why you not matching? Or a better note? ${gmcRow.annotatedAssetId} - ${vaultRow.assigned_asset_tag}`;
    }

    // 3. and then looking at the vault data I'd need to identify serials that didn't exist in the gmc export
    // which should be possible by just checking for undefined on keys for those objects
    // TODO(@Nyrvous): what happens if we don't find gmcRow that matches vaultRow?
    if (!gmcRow) {
      // what do we do if there is no match for such serial?
      return undefined;
    }

    // TODO(@Nyrvous): anything else we need to add to each row while we are at it?
    return { ...gmcRow, ...vaultRow, note };
  });

  // this converts JS Object -> comma separated string
  const combinedCSV = Papa.unparse(combinedData);
  return combinedCSV;
}
