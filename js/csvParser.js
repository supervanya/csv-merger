export function combineCSV(vaultCSV, gmcCSV) {
  // this helps to have the same column name
  const shortenSerialNumberHeader = (header) =>
    header === "serialNumber" || header === "serial_number" ? "sn" : header;

  const parseFile = (csvFileString) => {
    return Papa.parse(csvFileString, {
      header: true,
      transformHeader: shortenSerialNumberHeader,
    });
  };

  const vaultData = parseFile(vaultCSV).data;
  const gmcData = parseFile(gmcCSV).data;

  const combinedData = vaultData.map((vaultRow) => {
    // 1. So basically I think flow wise, I'd map the gmc object to the vault object based on serial number as a key.
    const gmcRow = gmcData.find((gmcRow) => gmcRow.sn === vaultRow.sn);

    // 2. I would then need to compare the GMC asset tag against
    // the vault asset tag and write a note if it doesn't match
    let note;
    if (gmcRow.annotatedAssetId !== vaultRow.assigned_asset_tag) {
      note = `Why you not matching? Or a better note? ${gmcRow.annotatedAssetId} - ${vaultRow.assigned_asset_tag}`;
    }

    // 3. and then looking at the vault data I'd need to identify serials that didn't exist in the gmc export
    // which should be possible by just checking for undefined on keys for those objects
    if (!gmcRow) {
      // what do we do if there is no match for such serial?
      return undefined;
    }

    return { ...gmcRow, ...vaultRow, note };
  });

  const combinedCSV = Papa.unparse(combinedData);
  return combinedCSV;
}
