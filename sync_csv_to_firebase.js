const fs = require('fs');
const readline = require('readline');
const LZString = require('lz-string');

function parseCSV(content) {
  const lines = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1];
    
    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          field += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false; // End of quoted field
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\r' || c === '\n') {
        row.push(field);
        lines.push(row);
        row = [];
        field = '';
        if (c === '\r' && next === '\n') {
          i++; // Skip \n
        }
      } else {
        field += c;
      }
    }
  }
  if (row.length > 0 || field !== '') {
    row.push(field);
    lines.push(row);
  }
  return lines;
}

function parseExDate(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400000));
  let s = String(v).trim();
  if (s === "") return null;
  
  let parts = s.split('/');
  if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  parts = s.split('-');
  if (parts.length === 3) {
      if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
      return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  let t = Date.parse(s);
  if (!isNaN(t)) return new Date(t);
  return null;
}

async function main() {
  const originalCsvPath = 'QC 08.Jun.26.csv';
  const csvPath = 'QC_temp.csv';
  console.log(`Copying ${originalCsvPath} to ${csvPath} to avoid file locks...`);
  fs.copyFileSync(originalCsvPath, csvPath);

  console.log(`Reading and parsing ${csvPath}...`);
  
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  console.log("Parsing CSV contents...");
  const parsedRows = parseCSV(fileContent);
  if (parsedRows.length === 0) {
    console.error("Empty CSV data!");
    return;
  }

  const headers = parsedRows[0].map(h => h.trim());
  const processed = [];

  const findKey = (aliases) => {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let alias of aliases) {
      const normA = norm(alias);
      for (let h of headers) {
        if (norm(h) === normA) return h;
      }
    }
    return null;
  };

  const map = {
    sub: findKey(['Subcontractor', 'Sub-Contractor', 'SubCon', 'Sub', 'Nhà thầu phụ', 'IsSubContractor']),
    sys: findKey(['System', 'SysNo', 'Sys', 'Hệ thống']),
    joint: findKey(['Joint No.', 'Joint No', 'Joint_No', 'Joint', 'Mối hàn', 'JointNo']),
    dwg: findKey(['Drawing No.', 'Drawing No', 'Dwg No', 'Drawing', 'Bản vẽ', 'DrawingNo']),
    line: findKey(['Line', 'Line No', 'Line_No', 'Tuyến']),
    spool: findKey(['SpoolNo', 'Spool No', 'Spool_No', 'Spool', 'Số Spool']),
    welder: findKey(['Welder ID', 'Welder', 'WelderNo', 'Thợ hàn', 'WelderID']),
    size: findKey(['Size', 'Kích thước']),
    diaIn: findKey(['DiaIn', 'Dia-Inch', 'DiaInch']),
    thick: findKey(['Thickness', 'Thick', 'Độ dày', 'Thk']),
    mat: findKey(['Material', 'Mat', 'Vật liệu']),
    wDate: findKey(['WeldingCompletedDate', 'Welding Completed Date', 'Weld Date', 'Welding Date', 'Ngày hàn']),
    weldType: findKey(['Weld Type', 'WeldType', 'Loại mối hàn']),
    testPkg: findKey(['Test Package No.', 'Test Package', 'TestPkg', 'TP No', 'Mã Test Package', 'TestPackageNo']),
    spec: findKey(['Spec', 'Specification', 'Tiêu chuẩn']),
    visualRes: findKey(['Visual Result', 'Visual', 'VT Result']),
    rtRes: findKey(['RTResult', 'RT Result', 'RT_Result']),
    pautRes: findKey(['PAUT Result', 'PAUTResult']),
    rtRep: findKey(['RT Report No.', 'RT Rep', 'RTReportNo']),
    pautRep: findKey(['PAUT Report No', 'PAUT Rep', 'PAUTReportNo']),
    mtRep: findKey(['MT Report No.', 'MT Rep', 'MTReportNo']),
    ptRep: findKey(['PT Report No.', 'PT Rep', 'PTReportNo']),
    pmiRep: findKey(['PMIReportNo', 'PMI Report No.', 'PMI Rep']),
    reqRT: findKey(['RT']),
    reqPAUT: findKey(['PAUT']),
    reqMT: findKey(['MT']),
    reqPT: findKey(['PT']),
    mtRes: findKey(['MT Result', 'MT_Result', 'MTResult']),
    ptRes: findKey(['PT Result', 'PT_Result', 'PTResult']),
    rtDate: findKey(['RT Report Date', 'RT Date']),
    pautDate: findKey(['PAUT Report Date', 'PAUT Date']),
    pwhtRes: findKey(['PWHTResult', 'PWHT Result']),
    reqPwht: findKey(['PWHT']),
    reqPmi: findKey(['PMI']),
    lenNDT: findKey(['LengthNDT', 'Length']),
    lenDefect: findKey(['Defect Length', 'Defect']),
    jointRem: findKey(['TV', 'Joint Remark', 'Remark', 'Ghi chú']),
    location: findKey(['Location', 'Area', 'Vị trí']),
    visualACC: findKey(['VisualACC', 'Visual ACC', 'Visual Acc']),
    visualREJ: findKey(['VisualREJ', 'Visual REJ', 'Visual Rej']),
    defectLoc: findKey(['DefectLocation', 'Defect Location']),
    defectID: findKey(['DefectID', 'Defect ID']),
    defectLenInfo: findKey(['DefectLengthInfo', 'Defect Length Info']),
    typeOfDefect: findKey(['TypeOfDefect', 'Type Of Defect', 'Defect Type']),
    fitupAcc: findKey(['FitUpACC', 'FitUp ACC', 'Fit-Up ACC']),
    hardnessRep: findKey(['HardnessTestReportNo', 'Hardness Report No', 'HardnessRep']),
    ferriteRep: findKey(['FerriteTestReportNo', 'Ferrite Report No', 'FerriteRep']),
    hardRep: findKey(['Hardness', 'HardnessReq']),
    penalty: findKey(['Penalty', 'PEN']),
    hydroRep: findKey(['HydroTestReportNo', 'Hydro Test Report No', 'HydroRep']),
    releaseRep: findKey(['ReleaseNotesReportNo', 'Release Notes Report No', 'ReleaseRep']),
    summaryRep: findKey(['SummaryReportNo', 'Summary Report No', 'SummaryRep']),
    ndtRequest: findKey(['NDTRequest', 'NDT Request', 'NDTReq'])
  };

  const getVal = (row, field) => { 
    const k = map[field]; 
    return (k && row[k] !== undefined && row[k] !== null) ? row[k] : ""; 
  };

  console.log("Headers loaded:", headers.slice(0, 10), "...");

  let count = 0;
  for (let i = 1; i < parsedRows.length; i++) {
    const cols = parsedRows[i];
    if (cols.length === 0 || (cols.length === 1 && cols[0] === "")) continue;

    const r = {};
    headers.forEach((h, idx) => {
      r[h] = cols[idx] || '';
    });

    const jointVal = getVal(r, 'joint');
    if (!jointVal) continue;

    const diaInVal = parseFloat(getVal(r, 'diaIn')) || 0;
    const sizeVal = diaInVal;
    const wDateStr = getVal(r, 'wDate') || '';
    const wDateObj = parseExDate(wDateStr);
    
    const clean = (val) => val ? val.toString().trim().toUpperCase() : '';
    const getStatus = (val) => { 
        if(!val) return '';
        const s = val.toString().trim().toUpperCase(); 
        if(s.includes('REJ')||s.includes('FAIL')) return 'REJ'; 
        if(s.includes('ACC')||s.includes('OK')) return 'ACC'; 
        if(s.includes('RS')) return 'RS'; 
        return ''; 
    };

    const isReq = (val) => {
        if(!val) return false;
        const s = val.toString().trim().toUpperCase();
        return s.length > 0 && s !== '0' && s !== '0%' && s !== 'N/A' && s !== '-';
    };
    
    const hasRep = (val) => {
        if(!val) return false;
        const s = val.toString().trim().toUpperCase();
        return s.length > 0 && s !== '(BLANK)' && s !== 'PENDING' && s !== 'TBA' && s !== 'WAIT' && s !== 'N/A' && s !== '-' && s !== 'NULL';
    };

    const fitupVal = getStatus(getVal(r, 'fitupAcc'));
    const visAccVal = getStatus(getVal(r, 'visualACC'));

    processed.push({
      id: processed.length + 1,
      isSub: clean(getVal(r, 'sub')),
      system: getVal(r, 'sys'),
      dwg: getVal(r, 'dwg'),
      line: getVal(r, 'line'),
      spool: getVal(r, 'spool'),
      welder: getVal(r, 'welder'),
      joint: jointVal.toString(),
      size: getVal(r, 'size'),
      sizeVal: sizeVal,
      thick: getVal(r, 'thick'),
      mat: getVal(r, 'mat'),
      weldType: getVal(r, 'weldType') || '',
      jointRem: getVal(r, 'jointRem') || '',
      location: getVal(r, 'location') || '',
      testPkg: getVal(r, 'testPkg'),
      rtRep: getVal(r, 'rtRep'),
      pautRep: getVal(r, 'pautRep'), 
      mtRep: getVal(r, 'mtRep'),
      ptRep: getVal(r, 'ptRep'),
      pmiRep: hasRep(getVal(r, 'pmiRep')) ? getVal(r, 'pmiRep') : '',
      hardRep: getVal(r, 'hardRep') || '', 
      ferriteRep: hasRep(getVal(r, 'ferriteRep')) ? getVal(r, 'ferriteRep') : '',
      ndtRate: getVal(r, 'ndtRate'),
      spec: getVal(r, 'spec'),
      wDate: wDateObj ? wDateObj.getTime() : null, 
      wDateStr: wDateObj ? wDateObj.toLocaleDateString('en-GB') : (wDateStr.trim() !== '' ? wDateStr.trim() : 'No Date'), 
      rtDate: parseExDate(getVal(r, 'rtDate'))?.getTime() || null, 
      pautDate: parseExDate(getVal(r, 'pautDate'))?.getTime() || null,
      rtRes: getStatus(getVal(r, 'rtRes')), 
      pautRes: getStatus(getVal(r, 'pautRes')), 
      mtRes: getStatus(getVal(r, 'mtRes')), 
      ptRes: getStatus(getVal(r, 'ptRes')),
      reqRT: isReq(getVal(r, 'reqRT')),
      reqPAUT: isReq(getVal(r, 'reqPAUT')),
      reqMT: isReq(getVal(r, 'reqMT')),
      reqPT: isReq(getVal(r, 'reqPT')),
      reqPwht: isReq(getVal(r, 'reqPwht')),
      reqPmi: isReq(getVal(r, 'reqPmi')),
      hasRT: hasRep(getVal(r, 'rtRep')),
      hasPAUT: hasRep(getVal(r, 'pautRep')), 
      hasMT: hasRep(getVal(r, 'mtRep')),
      hasPT: hasRep(getVal(r, 'ptRep')),
      pwhtRes: getStatus(getVal(r, 'pwhtRes')), 
      lenNDT: parseFloat(getVal(r, 'lenNDT')) || 0,
      lenDefect: parseFloat(getVal(r, 'lenDefect')) || parseFloat(getVal(r, 'defectLenInfo')) || 0, 
      visualRes: (() => {
          const vr = getStatus(getVal(r, 'visualRes'));
          if (vr) return vr;
          const vRej = getVal(r, 'visualREJ');
          if (vRej && hasRep(vRej)) return 'REJ';
          if (visAccVal) return visAccVal;
          return '';
      })(),
      defectLoc: getVal(r, 'defectLoc') || '',
      defectID: getVal(r, 'defectID') || '',
      defectLenInfo: getVal(r, 'defectLenInfo') || '',
      typeOfDefect: getVal(r, 'typeOfDefect') || '',
      fitupAcc: fitupVal,
      visualACC: visAccVal,
      hardnessRep: hasRep(getVal(r, 'hardnessRep')) ? getVal(r, 'hardnessRep') : '',
      penalty: parseFloat(getVal(r, 'penalty')) || 0,
      hydroRep: getVal(r, 'hydroRep'),
      releaseRep: getVal(r, 'releaseRep'),
      summaryRep: getVal(r, 'summaryRep'),
      ndtRequest: (() => { const v = getVal(r, 'ndtRequest'); return v && v.toString().trim() === '1'; })()
    });
    
    count++;
    if (count % 20000 === 0) {
      console.log(`Parsed ${count} rows...`);
    }
  }
  console.log(`Parsed ${count} rows...`);

  console.log(`Total parsed rows: ${processed.length}`);

  // Fetch current data from Firebase first to get hydroJson and matrixJson
  const dbUrl = "https://piping-dashboard-v12-default-rtdb.asia-southeast1.firebasedatabase.app/dashboard_data.json";
  console.log("Fetching existing hydroJson & matrixJson from Firebase RTDB...");
  const getRes = await fetch(dbUrl);
  const existingData = await getRes.json();
  
  const hydroJson = (existingData && existingData.hydroJson) || "";
  const matrixJson = (existingData && existingData.matrixJson) || "";

  console.log("Compressing rawJson using LZString...");
  const rawJsonCompressed = LZString.compressToUTF16(JSON.stringify(processed));

  const payload = {
    timestamp: Date.now(),
    rawJson: rawJsonCompressed,
    hydroJson: hydroJson,
    matrixJson: matrixJson,
    isCompressed: true
  };

  console.log("Uploading payload to Firebase RTDB...");
  const putRes = await fetch(dbUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    console.log("Firebase Database updated successfully with complete schema columns!");
  } else {
    console.error("Firebase update failed:", putRes.statusText);
  }

  try {
    fs.unlinkSync(csvPath);
    console.log(`Cleaned up temporary file ${csvPath}`);
  } catch (err) {
    console.error(`Failed to clean up temporary file ${csvPath}:`, err.message);
  }
}

main().catch(console.error);
