import React, { useState, useMemo } from 'react';

const DEFAULT_UPCS = `764009009975
764009027320
764009039453
764009009999
764009009951
764009009968
764009009982
764009031860
764009047007
764009054616
764009027290
764009009944
764009016980
764009009937
764009041531
764009017864
764009024787
764009042736
764009024794
764009009791
764009016089
764009047922
764009010018
072311130219
75031602
75031589
7501064112546
75032715
080660954011
5410228104445
5410228144755
641194200045
5740700993299
764009047229
5410228141266
5410228141785
8412598005893
764009017871
8410793262936
8712000055233
764009014412
764009002327
764009013118
764009020468
764009045577
7500462981006
041224860025
674545000841
721059707503
619947000020
760608550245
5010677850209
7312040551248
026964500233
026964823967
026964257014
7401005008597
7401005002151
0
080432400432
5000299225028
5000281003160
5000281004020
5000281055084
5000196005921
50196388
50196913
5000267023601
5000267116419
5000267024011
5000267197630
5010314048907
5010327105215
5000299609354
0
0
0
0
3035542004206
5011013100118
762288000010
762288000027
5000291020706
3263280117289
5010327755014
5010677715003
8002230000302
8003930111114
8003930001606
8003930001613
8007880179002
8007880138504
8007880175004
8414542100067
8410631890000
8436557310460
7791250001673
3525490010232
7791203001231
8410406311006
089819006526
7804320753980
7804320568300
7791540091193
8410702005012
3185370729960
803275305517
803275305609
756959960413
7702007030174
8423207208529
016000264601
7441029522204
873617004361
873617003777
756959960079
756959960031
028400025409
7501008031759
7501008041680
7501008041666
7501008041673
7501008041703
7501008005538
7501008000625
4008713702750
4008713707946
803275305494
038527014309
7441001007002
7506475111133
7441001010217
7441001010194
7441001010170
873617008086
7441001620263
789742895050
7441006710044
721282408062
086581002336
086581002312
086581010881
086581005085
086581007317
086581006280
7441163400697
086581001100
7441163401168
7702133006647
7622210110251
7590011151110
7443001141755
014100085478
873617007836
873617004057
7443022070287
028400023573
7441029514179
7441029518528
7441029517392
7441029556773
7441029556759
7441029500097
7441029500110
7441029507768
7441029500202
7441029500318
7441029500301
7441029522686
7441029522693
7441029501537
721282406679
028400017145
028400020893
7441065900059
7441000723767
7441005705829
086581004187
086581010867
7441012500400
028400018432
893594002105
893594002112
893594002099
7441000704025
7441000700591
7441000705534
7441000705664
658480001101
028400570992
028400017480
7441029520712
7501058625977
803275000191
884912359155
803275305371
7441136203386
884912359162
7501008034262
7501008042847
4008713702767
039944199099
7441005618648
7441005615951
7441005636000
7441005636413
7441005636178
039944199228
7441005627565
7441005636017
7441005636185
7441005636420
7441005636215
039944099108
7441005636079
7441005636154
7441005636192
7415602001349
7415602000663
7415602025345
7415602034484
7415602006214
7415602001363
7415602000120
7415602001356
806246110356
806246110530
806246110240
806246110844
806246110875
806246110486
806246110882
806246110318
806246110400
806246110417
806246110479
806246110424
7441057261090
7441057261106
7441057263469
7441008164388
7441008169840
7441008164364
7441008164357
7441000312077
7441000312039
7441000312084
7441000312046
086623003055
7501199404295
7501199404301
7501199404417
7411000346754
7411000383902
7411000328255
7411000329641
7411000329665
030772122365
030772118030
030772121047
030772122266
030772122754
030772121108
030772121207
037000509608
030772121016
030772122198
7411000329207
7411000329214
7411000328385
7411000356395
7411000365335
7411000382851
7411000360026
7411000360033
7702626216997
7702626217000
7441001310652
7441001304613
7501058757753
7501058757449
7441001301742
7501058715883
7501058715890
7500435141499
7500435126144
7500435126137
7509546044453
099176231837
099176232643
099176231974
7509546075303
099176231813
7509546654263
7509546651316
7509546670478
7509546684208
7509546684192
7509546684178
7509546684154
7509546684161
7509546688558
099176263951
099176264163
099176264330
099176264347
099176264323
099176265627
099176264057
7509546654287
7509546678320
748928001845
748928010564
748928010755
748928011042
748928006987
7509546017143
099176264354
7509546051932
7509546076195
7509546073651
7509546657684
7509546678351
7509546078915
7509546677880
748928001982
748928010823
7441057266422
7441057266439
7441057267047
7501036624169
7441057266545
7441057266101
7441057266118
7441057266149
7441008168362
7441008173328
7441008175674
7441008168324
7441008168348
7441008171652
7441008171669
7441008156888
7441008101147
7751493009645
7441008101567
7443007536661
7443007536562
7443007536234
7443007536272
7443007536395
7443007536326
7441001633980
7441001630002
7441001633997
7441001629990
7441001627606
7441001631207
7441001627613
7441001635175
7443023490053
7443023490008
7443012780370
7443012780301
7443012780332
7443012780318
7443012780639
7443012780462
7443012780387
7443012780622
7443012781308
7441001614415
7441001602245
7441001602238
7441001615788
7441001602764
7441001613968
7441014709351
7441014704318
7441014704158
7441014706336
7443023490060
7441001602641
787003000663
7441001612978
7441001601811
7441001645204
7441001645198
7441001639661
7441001629716
7441001626142
7441001600586
7441001601132
7441001605253
7441001698644
7441001600036
7441001601064
7441001600029
7441001601156
7441001631405
7441001617577
7441001638565
7441001601071
7441001629945
0
0
7441001601002
7441001601057
7441001612060
7441001608056
7441001611872
7441001612206
7441001627903
7443012781605
7443012780912
7443012780905
7443012780899
7443012781544
7441001607363
7441001607400
7441001607370
7441001607387
7441001608315
7441001606540
7441001605512
7441001606649
7441001632600
7441001605741
7441001626319
7441001619779
7441001605772
7441001628948
7441001623851
7441001643446
0
7441001644559
7441001638749
7441014707432
7441014708279
7441014700730
7441000503970
7441000505011
7441000500184
7441000500931
7441000502560
7441014708262
7441001644153
7441001644160
7441001616389
7441014705759
7441014700808
7441000504458
7441000502393
7441000504571
7441000504496
7441000504465
7441000505691
7441000505738
7441000505158
7441001628405
7441013502588
7441001612510
7441001631269
7441001612527
7441001605017
7441001605048
7441001608186
7441001604997
7441001604980
5740900832305
5740900401068
7443012780530
7441001608575
7441001614996
7441001604508
7441001604492
7441001609626
7441001609633
7441001609619
7441001609671
7441001609664
7441001621970
7441001609640
7441001615672
7441001609497
7441001609503
7441001609480
7441001609541
7441001609466
7441001609534
7441009402809
7441009472802
7441001610554
7441001610530
7441001610516
7441001610509
7441001623752
7441001629198
7441001639944
7441001609596
7441001637568
7441001637575
7441001639913
7441001630903
7441001630897
7441001634178
7441134016940
7441134017275
7441134017053
7441042699624
7441042699662
7441042600002
7441000708108
7441010400108
7441002432049
7802950062809
7411000342480
7441002428011
747627100217
7411000341278
7411000341087
01307605
7441000635039
747627005116
747627005123
8413971000566
7411000342961
7411000343623
088313261448
7441006022383
8002210560000
8002210112445
064144004126
731701000494
7401004221171
7441006022390
7441042600545
052603041201
052603041843
051000027955
7441006002279
7441042600699
088313590746
7410031392914
7441002639189
7441002637765
7441002639196
7441002638243
7441002638229
7441002639455
7441002637611
7441002636904
7441047000791
796500001417
033844003999
7441007200889
7441155900105
8076800195033
7411000313930
7411000313947
7411000313978
7441006003719
7441000714550
7441006003610
8413971001310
7441000723958
7790070012203
033844002206
731701480142
7441000712808
731701001279
8005121000085
8005121041088
033844004484
051000025494
033844001018
088169431101
088169430982
088169430777
088169430586
088169429900
8076800195057
722776020029
7441000725532
7441000712365
7441000712372
7441000727123
7441003400108
7441003400092
7441003400207
645860018439
645860018576
645860018590
645860018606
645860018583
645860018453
645860018408
645860018422
070177010775
764009040350
764009040268
764009040213
764009040237
7441001730504
748366124113
748366123994
748366133979
9002490206710
9002490204006
9002490212148
049000050752
049000050745
7441003505070
764009050625
764009050618
764009051950
884394002495
8809041420912
884394002518
7613036760249
070847019848
645860000922
645860001479
764009004574
7441001703072
764009036025
764009048103
7441003501737
7441003501874
7441003505193
7441009043163
7501125196102
7501125168420
7501125168437
7501125168369
7501125168345
7501125168390
7502268547059
7501125168376
650240032295
650240063220
650240063213
650240063237
650240061325
7441001619069
7441001619274
7441001620034
7441001622908
7441001618963
7441001620065
7441001604447
7441001620010
7441001619045
764009203410
764009204011
764009202611
764009008008
7441042801102
7441042801126
7441042801607
7441003501966
7441003518483
7441003561243
7441003505810
7441003500488
7441003502871
7441003502888
7441003500150
7441003500815
7441003518230
7441003506169
7441003596207
7441003501553
7441003596122
7441003505230
7441003505483
7441003500242
7441003509009
7441003539013
7401006400901
7441003598096
7441003506657
7441003506442
7441003570481
7441003570818
7441003596405
7441003571815
7441003571488
7441003571150
7441003572232
7441003571228
645860001677
7441003590816
7441003590021
7441003590489
7441003599536
7441006818283
7441006818306
7441006818276
756969000024
756969000031
756969000512
756969000079
730345000020
730345002772
070177118518
070177177669
088105007933
7509546049014
7509546000343
7501035911017
7509546653518
7509546683874
7509546653402
7509546697970
037000449829
78914407
7702191001097
067238891190
7861001342314
7791293048475
7506306241183
7411000314036
7891150076051
7506306247956
7506306247949
7506306254374
7411000359259
7506306252875
7506306252851
7702018874781
7702018874729
7702018037896
7506339315899
7506339337525
7702018382330
7702018072217
047400179660
7500435169691
7500435204026
7500435204040
7702018037865
7500435019811
7500435019828
7500435019880
7500435019545
7500435019491
7500435231244
7500435231268
7500435231237
7500435162241
7500435145404
7500435145411
7500435193788
7500435193795
7500435184724
7500435193733
7500435193740
7500435184731
7441008156703
7809604026972
8411135654792
8410190585997
7891010974336
7702031518631
7702035432506
7702031887942
7702035432339
7702035431110
7702031311218
7702031244493
7702031244516
4005900036742
7501054550327
7501054550372
7501054509110
4005900564474
7501054500063
7800005082024
7800005064020
7500435201339
7501001100285
7500435250870
7509546668819
7509546689838
037000862253
037000862246
037000862260
037000828358
037000828433
037000749585
037000794660
037000749714
037000749691
037000749684
030772097564
078300081098
078300081111
099176922391
099176922254
099176922353
099176922599
099176922674
7509546650104
75076825
75076818
7506306247932
7702006401777
7702006402088
7702006402095
75073107
7501019006630
7501019006364
7501019006647
7501019032172
7501019006692
7501019040641
7501019039744
7501019053870
7501019050480
7501019051104
7501019056987
7501019056994
7501019057038`;

const UpcAudit = ({ products }) => {
    const [upcInput, setUpcInput] = useState(DEFAULT_UPCS);
    const [results, setResults] = useState(null);

    const handleCheck = () => {
        // Parse input UPCs
        const inputUpcs = upcInput
            .split('\n')
            .map(u => u.trim())
            .filter(u => u && u !== '0');

        const uniqueInputUpcs = [...new Set(inputUpcs)];

        // Helper to normalize UPC for comparison (strip leading zeros)
        const normalizeUPC = (upc) => {
            if (!upc) return '';
            return String(upc).replace(/^0+/, '');
        };

        // Group actual products by store using normalized UPCs as keys
        const walmartProductsByUpc = new Map();
        const mxmProductsByUpc = new Map();

        products.forEach(p => {
            if (!p.upc || p.upc === 'N/A') return;
            const normUpc = normalizeUPC(p.upc);
            if (p.store === 'Walmart') walmartProductsByUpc.set(normUpc, p);
            if (p.store === 'Masxmenos') mxmProductsByUpc.set(normUpc, p);
        });

        const foundInBoth = [];
        const onlyInWalmart = [];
        const onlyInMxM = [];
        const missingEverywhere = [];

        uniqueInputUpcs.forEach(upc => {
            const normUpc = normalizeUPC(upc);
            
            const wmProduct = walmartProductsByUpc.get(normUpc);
            const mxmProduct = mxmProductsByUpc.get(normUpc);

            const hasWM = !!wmProduct;
            const hasMxM = !!mxmProduct;

            if (hasWM && hasMxM) {
                foundInBoth.push({ 
                    upc, 
                    name: wmProduct?.name || 'Unknown Product',
                    brand: wmProduct?.brand || '',
                    presentation: wmProduct?.presentation || '',
                    priceWalmart: wmProduct?.price || 0,
                    priceMxM: mxmProduct?.price || 0
                });
            } else if (hasWM && !hasMxM) {
                onlyInWalmart.push({ 
                    upc, 
                    name: wmProduct?.name || 'Unknown Product',
                    brand: wmProduct?.brand || '',
                    presentation: wmProduct?.presentation || '',
                    price: wmProduct?.price || 0
                });
            } else if (!hasWM && hasMxM) {
                onlyInMxM.push({ 
                    upc, 
                    name: mxmProduct?.name || 'Unknown Product',
                    brand: mxmProduct?.brand || '',
                    presentation: mxmProduct?.presentation || '',
                    price: mxmProduct?.price || 0
                });
            } else {
                missingEverywhere.push(upc);
            }
        });

        setResults({
            totalChecked: uniqueInputUpcs.length,
            foundInBoth,
            onlyInWalmart,
            onlyInMxM,
            missingEverywhere
        });
    };

    const exportWalmartCSV = () => {
        if (!results || results.onlyInWalmart.length === 0) return;
        const headers = ["Tienda", "UPC", "Marca", "Nombre del Producto", "Presentación", "Precio"];
        const csvRows = results.onlyInWalmart.map(item => [
            `"Walmart"`, `"${item.upc}"`, `"${(item.brand || '').replace(/"/g, '""')}"`,
            `"${(item.name || '').replace(/"/g, '""')}"`, `"${(item.presentation || '').replace(/"/g, '""')}"`,
            `"${item.price}"`
        ].join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'auditoria_walmart.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportMxMCSV = () => {
        if (!results || results.onlyInMxM.length === 0) return;
        const headers = ["Tienda", "UPC", "Marca", "Nombre del Producto", "Presentación", "Precio"];
        const csvRows = results.onlyInMxM.map(item => [
            `"Masxmenos"`, `"${item.upc}"`, `"${(item.brand || '').replace(/"/g, '""')}"`,
            `"${(item.name || '').replace(/"/g, '""')}"`, `"${(item.presentation || '').replace(/"/g, '""')}"`,
            `"${item.price}"`
        ].join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'auditoria_mxm.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportBothCSV = () => {
        if (!results || results.foundInBoth.length === 0) return;
        const headers = ["Tienda", "UPC", "Marca", "Nombre del Producto", "Presentación", "Precio"];
        const csvRows = [];
        results.foundInBoth.forEach(item => {
            csvRows.push([
                `"Walmart"`, `"${item.upc}"`, `"${(item.brand || '').replace(/"/g, '""')}"`,
                `"${(item.name || '').replace(/"/g, '""')}"`, `"${(item.presentation || '').replace(/"/g, '""')}"`,
                `"${item.priceWalmart}"`
            ].join(','));
            csvRows.push([
                `"Masxmenos"`, `"${item.upc}"`, `"${(item.brand || '').replace(/"/g, '""')}"`,
                `"${(item.name || '').replace(/"/g, '""')}"`, `"${(item.presentation || '').replace(/"/g, '""')}"`,
                `"${item.priceMxM}"`
            ].join(','));
        });
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'auditoria_ambos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyMissingUPCs = () => {
        if (!results || results.missingEverywhere.length === 0) return;
        const textToCopy = results.missingEverywhere.join('\n');
        navigator.clipboard.writeText(textToCopy);
        alert('¡UPCs faltantes copiados al portapapeles!');
    };

    const parsePrice = (priceVal) => {
        if (!priceVal) return 0;
        try {
            const clean = String(priceVal).replace(/[^0-9,]/g, '').replace(',', '.');
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num;
        } catch (e) {
            return 0;
        }
    };

    const formatPriceDisplay = (priceVal) => {
        const p = parsePrice(priceVal);
        return p > 0 ? p.toLocaleString('es-CR') : 'N/A';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-900">
                <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                Auditoría de Disponibilidad UPC
            </h2>
            <p className="text-slate-500 mb-6 border-l-2 border-slate-300 pl-4">
                Pegue una lista de códigos UPC (uno por línea) a continuación. Cruzaremos esta lista con nuestro catálogo actual de productos para decirle exactamente qué UPC faltan en Walmart y cuáles faltan en Masxmenos.
            </p>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4 flex flex-col">
                    <label className="text-sm font-semibold text-slate-700 mb-2">Lista de UPC (uno por línea)</label>
                    <textarea 
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 min-h-[400px] font-mono text-sm mb-4 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
                        value={upcInput}
                        onChange={(e) => setUpcInput(e.target.value)}
                        placeholder="764009009975..."
                    />
                    <button 
                        onClick={handleCheck}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all"
                    >
                        Ejecutar Auditoría UPC
                    </button>
                </div>

                <div className="w-full md:w-3/4 flex flex-col">
                    {!results ? (
                        <div className="h-full flex items-center justify-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                            Haga clic en "Ejecutar Auditoría UPC" para escanear sus artículos contra la base de datos.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-slate-500 text-sm font-semibold mb-1">Total UPCs Válidos</div>
                                    <div className="text-3xl font-bold text-slate-900">{results.totalChecked}</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-emerald-700 text-sm font-semibold mb-1">Encontrados en Ambas Tiendas</div>
                                    <div className="text-3xl font-bold text-emerald-600">{results.foundInBoth.length}</div>
                                </div>
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-rose-700 text-sm font-semibold mb-1">Faltantes en Todas Partes</div>
                                    <div className="text-3xl font-bold text-rose-600">
                                        {results.missingEverywhere.length}
                                    </div>
                                </div>
                            </div>

                            {/* Only in Walmart List */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <h3 className="text-blue-600 font-bold mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span>Productos Exclusivos en Walmart</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={exportWalmartCSV} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors" title="Exportar CSV">Exportar</button>
                                        <span className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">{results.onlyInWalmart.length} artículos</span>
                                    </div>
                                </h3>
                                {results.onlyInWalmart.length === 0 ? (
                                    <div className="text-slate-400 text-sm text-center py-8">¡Ninguno exclusivo en Walmart!</div>
                                ) : (
                                    <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {results.onlyInWalmart.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                                                <div className="bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-500 font-mono text-xs w-[140px] text-center shadow-sm shrink-0">
                                                    {item.upc}
                                                </div>
                                                <div className="text-slate-800 text-sm font-bold truncate flex-1" title={item.name}>
                                                    {item.name}
                                                    <span className="text-xs text-slate-400 font-normal ml-2 block sm:inline">{item.brand} • {item.presentation}</span>
                                                </div>
                                                <div className="text-blue-600 font-bold text-sm shrink-0">
                                                    {formatPriceDisplay(item.price) !== 'N/A' ? '₡' : ''}{formatPriceDisplay(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Only in Masxmenos List */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mt-6">
                                <h3 className="text-orange-600 font-bold mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span>Productos Exclusivos en Masxmenos</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={exportMxMCSV} className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200 transition-colors" title="Exportar CSV">Exportar</button>
                                        <span className="bg-orange-100 px-2 py-1 rounded text-xs text-orange-800">{results.onlyInMxM.length} artículos</span>
                                    </div>
                                </h3>
                                {results.onlyInMxM.length === 0 ? (
                                    <div className="text-slate-400 text-sm text-center py-8">¡Ninguno exclusivo en Masxmenos!</div>
                                ) : (
                                    <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {results.onlyInMxM.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-orange-200 transition-colors">
                                                <div className="bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-500 font-mono text-xs w-[140px] text-center shadow-sm shrink-0">
                                                    {item.upc}
                                                </div>
                                                <div className="text-slate-800 text-sm font-bold truncate flex-1" title={item.name}>
                                                    {item.name}
                                                    <span className="text-xs text-slate-400 font-normal ml-2 block sm:inline">{item.brand} • {item.presentation}</span>
                                                </div>
                                                <div className="text-orange-600 font-bold text-sm shrink-0">
                                                    {formatPriceDisplay(item.price) !== 'N/A' ? '₡' : ''}{formatPriceDisplay(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Missing Everywhere List */}
                            {results.missingEverywhere.length > 0 && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm mt-6">
                                    <h3 className="text-rose-700 font-bold mb-4 flex items-center justify-between border-b border-rose-100 pb-3">
                                        <span>Productos Faltantes en Todas Partes</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={copyMissingUPCs} className="text-xs bg-rose-200 hover:bg-rose-300 text-rose-800 px-2 py-1 rounded transition-colors" title="Copiar al portapapeles">Copiar Todos</button>
                                            <span className="bg-rose-100 px-2 py-1 rounded text-xs text-rose-800">{results.missingEverywhere.length} artículos</span>
                                        </div>
                                    </h3>
                                    <div className="max-h-[200px] overflow-y-auto pr-2 flex flex-wrap gap-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {results.missingEverywhere.map((upc, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-500 font-mono text-xs shadow-sm">
                                                {upc}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Found Products List */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mt-6">
                                <h3 className="text-emerald-700 font-bold mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span>Productos Encontrados en Ambas Tiendas</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={exportBothCSV} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 transition-colors" title="Exportar CSV">Exportar</button>
                                        <span className="bg-emerald-100 px-2 py-1 rounded text-xs text-emerald-800">{results.foundInBoth.length} artículos</span>
                                    </div>
                                </h3>
                                {results.foundInBoth.length === 0 ? (
                                    <div className="text-slate-400 text-sm text-center py-8">No se encontraron productos en común.</div>
                                ) : (
                                    <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {results.foundInBoth.map((item, idx) => {
                                            const wPrice = parsePrice(item.priceWalmart);
                                            const mPrice = parsePrice(item.priceMxM);
                                            const isWalmartCheaper = wPrice > 0 && (wPrice < mPrice || mPrice === 0);
                                            const isMxMCheaper = mPrice > 0 && (mPrice < wPrice || wPrice === 0);
                                            
                                            return (
                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors">
                                                <div className="bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-500 font-mono text-xs w-[140px] text-center shadow-sm shrink-0">
                                                    {item.upc}
                                                </div>
                                                <div className="text-slate-800 text-sm font-bold truncate flex-1" title={item.name}>
                                                    {item.name}
                                                    <span className="text-xs text-slate-400 font-normal ml-2 block sm:inline">{item.brand} • {item.presentation}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 text-sm bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
                                                    <div className={`flex flex-col items-center px-2 ${isWalmartCheaper ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Walmart</span>
                                                        {formatPriceDisplay(item.priceWalmart) !== 'N/A' ? '₡' : ''}{formatPriceDisplay(item.priceWalmart)}
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200"></div>
                                                    <div className={`flex flex-col items-center px-2 ${isMxMCheaper ? 'text-orange-600 font-bold' : 'text-slate-500'}`}>
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">MxM</span>
                                                        {formatPriceDisplay(item.priceMxM) !== 'N/A' ? '₡' : ''}{formatPriceDisplay(item.priceMxM)}
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcAudit;
