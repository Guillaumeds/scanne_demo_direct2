/**
 * Mauritius Sugarcane Demo Data Generator
 * Generates realistic demo data for 40 blocs with complete crop cycles, operations, and work packages
 * Based on actual Mauritius sugarcane farming practices and data
 */



/**
 * Parse WKT coordinates to [lng, lat] array format
 */
function parseWKTToCoordinates(wkt: string): [number, number][] {
  try {
    const coordsMatch = wkt.match(/POLYGON\(\(([^)]+)\)\)/)
    if (!coordsMatch) {
      console.error('❌ WKT parsing failed - no POLYGON match:', wkt.substring(0, 50))
      return []
    }

    const coordPairs = coordsMatch[1].split(',').map(pair => pair.trim())
    const coordinates = coordPairs.map(pair => {
      const [lng, lat] = pair.split(' ').map(Number)

      // Validate Mauritius coordinates
      if (isNaN(lng) || isNaN(lat)) {
        console.error('❌ Invalid coordinate pair:', pair, '-> lng:', lng, 'lat:', lat)
        return null
      }

      if (lng < 57 || lng > 58 || lat < -21 || lat > -19) {
        console.error('❌ Coordinate outside Mauritius bounds:', pair, '-> lng:', lng, 'lat:', lat)
        return null
      }

      return [lng, lat] as [number, number]
    }).filter(coord => coord !== null) as [number, number][]

    console.log(`✅ WKT parsed successfully: ${coordinates.length} coordinates from "${wkt.substring(0, 30)}..."`)
    console.log(`   First coord: [${coordinates[0]?.[0]}, ${coordinates[0]?.[1]}]`)
    console.log(`   Last coord: [${coordinates[coordinates.length-1]?.[0]}, ${coordinates[coordinates.length-1]?.[1]}]`)

    return coordinates
  } catch (error) {
    console.error('❌ Error parsing WKT:', error, 'WKT:', wkt.substring(0, 50))
    return []
  }
}

// Mauritius sugarcane varieties with realistic data
export const MAURITIUS_VARIETIES = [
  {
    id: 'variety-r579',
    name: 'R579',
    maturity_months: 18,
    yield_potential: 120,
    harvest_period: 'mid-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m1176',
    name: 'M1176/77',
    maturity_months: 16,
    yield_potential: 110,
    harvest_period: 'early-season',
    disease_resistance: 'medium',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-r570',
    name: 'R570',
    maturity_months: 20,
    yield_potential: 135,
    harvest_period: 'late-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m2593',
    name: 'M2593/92',
    maturity_months: 15,
    yield_potential: 105,
    harvest_period: 'early-season',
    disease_resistance: 'medium',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m387',
    name: 'M387/85',
    maturity_months: 17,
    yield_potential: 115,
    harvest_period: 'mid-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// Field polygons from CSV data (first 40 fields with realistic Mauritius coordinates)
// Exact polygon coordinates from estate_fields.csv (first 40 rows)
// Each bloc gets the exact same polygon as the corresponding CSV row
export const CSV_FIELD_POLYGONS = [
  // Row 1: FLD00022
  { id: 'field1', name: 'Bloc 5316', area: 57.59, wkt: 'POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))' },
  // Row 2: FLD00023
  { id: 'field2', name: 'Bloc 5660', area: 17.34, wkt: 'POLYGON((57.643608 -20.427913, 57.643671 -20.427759, 57.646925 -20.425527, 57.648953 -20.424132, 57.649125 -20.424039, 57.649191 -20.424865, 57.649337 -20.425374, 57.649314 -20.425663, 57.648536 -20.426457, 57.648383 -20.426595, 57.648315 -20.426669, 57.648320 -20.426749, 57.648343 -20.426850, 57.648587 -20.427121, 57.647799 -20.427536, 57.647637 -20.427732, 57.647112 -20.428035, 57.646886 -20.428173, 57.646551 -20.428232, 57.646098 -20.428311, 57.645581 -20.428279, 57.645462 -20.428285, 57.644952 -20.427605, 57.644572 -20.427812, 57.644929 -20.428248, 57.643620 -20.428125, 57.643569 -20.428019, 57.643608 -20.427913))' },
  // Row 3: FLD00024
  { id: 'field3', name: 'Bloc 5216', area: 20.17, wkt: 'POLYGON((57.628588 -20.486595, 57.628700 -20.486871, 57.629105 -20.486987, 57.629551 -20.487170, 57.629543 -20.486881, 57.629567 -20.486538, 57.629608 -20.486249, 57.629661 -20.485968, 57.629730 -20.485634, 57.629803 -20.485443, 57.629925 -20.485187, 57.629897 -20.485154, 57.629829 -20.485130, 57.629797 -20.485148, 57.629774 -20.485214, 57.629709 -20.485383, 57.629667 -20.485437, 57.629616 -20.485454, 57.629457 -20.485499, 57.629394 -20.485515, 57.629397 -20.485568, 57.629397 -20.485645, 57.629311 -20.485898, 57.629203 -20.486023, 57.628980 -20.486224, 57.628782 -20.486394, 57.628630 -20.486506, 57.628594 -20.486552, 57.628588 -20.486595))' },
  // Row 4: FLD00025
  { id: 'field4', name: 'Bloc 5555', area: 14.42, wkt: 'POLYGON((57.629750 -20.488677, 57.629727 -20.488709, 57.629679 -20.488729, 57.628878 -20.488850, 57.628841 -20.488847, 57.628843 -20.488812, 57.628895 -20.488731, 57.628946 -20.488624, 57.628960 -20.488552, 57.628924 -20.488410, 57.628879 -20.488187, 57.628863 -20.488031, 57.628866 -20.487963, 57.628858 -20.487807, 57.628830 -20.487700, 57.628826 -20.487577, 57.628820 -20.487412, 57.628849 -20.487325, 57.628816 -20.487155, 57.628772 -20.487068, 57.628739 -20.486957, 57.628779 -20.486953, 57.629330 -20.487155, 57.629559 -20.487253, 57.629636 -20.487986, 57.629668 -20.488096, 57.629750 -20.488677))' },
  // Row 5: FLD00026
  { id: 'field5', name: 'Bloc 5727', area: 7.02, wkt: 'POLYGON((57.629732 -20.488171, 57.629821 -20.488685, 57.629884 -20.488700, 57.629956 -20.488683, 57.629966 -20.488668, 57.629732 -20.488171))' },
  // Row 6: FLD00027
  { id: 'field6', name: 'Bloc 5980', area: 6.32, wkt: 'POLYGON((57.628878 -20.488916, 57.628849 -20.488979, 57.628846 -20.489075, 57.628870 -20.489170, 57.628926 -20.489286, 57.629039 -20.489419, 57.629141 -20.489517, 57.629197 -20.489600, 57.629197 -20.489680, 57.629176 -20.489771, 57.629128 -20.489879, 57.629034 -20.490153, 57.629291 -20.490251, 57.629503 -20.490308, 57.629621 -20.490329, 57.629790 -20.490394, 57.629956 -20.490442, 57.629986 -20.490419, 57.629989 -20.490371, 57.629779 -20.488771, 57.628878 -20.488916))' },
  // Row 7: FLD00028
  { id: 'field7', name: 'Bloc 5123', area: 12.45, wkt: 'POLYGON((57.636721 -20.480994, 57.636650 -20.480983, 57.636627 -20.481116, 57.636481 -20.481566, 57.636199 -20.482284, 57.636038 -20.482661, 57.635983 -20.482821, 57.636057 -20.482864, 57.636351 -20.482959, 57.636575 -20.483075, 57.636741 -20.483160, 57.636930 -20.483287, 57.636958 -20.483292, 57.637298 -20.482403, 57.637574 -20.481592, 57.637657 -20.481337, 57.637662 -20.481288, 57.637622 -20.481267, 57.637043 -20.481087, 57.636721 -20.480994))' },
  // Row 8: FLD00029
  { id: 'field8', name: 'Bloc 5789', area: 23.67, wkt: 'POLYGON((57.635734 -20.480744, 57.635669 -20.480782, 57.635086 -20.482512, 57.635107 -20.482563, 57.635187 -20.482590, 57.635655 -20.482705, 57.635908 -20.482803, 57.636528 -20.481251, 57.636569 -20.481065, 57.636569 -20.480983, 57.635734 -20.480744))' },
  // Row 9: FLD00030
  { id: 'field9', name: 'Bloc 5432', area: 18.90, wkt: 'POLYGON((57.634614 -20.480346, 57.634562 -20.480364, 57.634020 -20.482487, 57.634028 -20.482518, 57.634981 -20.482575, 57.635016 -20.482555, 57.635600 -20.480774, 57.635589 -20.480705, 57.634614 -20.480346))' },
  // Row 10: FLD00031
  { id: 'field10', name: 'Bloc 5876', area: 31.25, wkt: 'POLYGON((57.632968 -20.482281, 57.633953 -20.482509, 57.634508 -20.480316, 57.633730 -20.480052, 57.633690 -20.480060, 57.632964 -20.482235, 57.632968 -20.482281))' },
  { id: 'field11', name: 'Bloc 5234', area: 15.78, wkt: 'POLYGON((57.636964 -20.483391, 57.636921 -20.483480, 57.636935 -20.483595, 57.637153 -20.484668, 57.637433 -20.486286, 57.637467 -20.486373, 57.637574 -20.486362, 57.637996 -20.486281, 57.638306 -20.486259, 57.638480 -20.486261, 57.639866 -20.486064, 57.639893 -20.486040, 57.639876 -20.486007, 57.639420 -20.485606, 57.639264 -20.485439, 57.639184 -20.485364, 57.638837 -20.485138, 57.638539 -20.484973, 57.638337 -20.484845, 57.638154 -20.484704, 57.637996 -20.484503, 57.637791 -20.484238, 57.637636 -20.484016, 57.637534 -20.483879, 57.637421 -20.483756, 57.637201 -20.483567, 57.636992 -20.483405, 57.636964 -20.483391))' },
  { id: 'field12', name: 'Bloc 5567', area: 28.43, wkt: 'POLYGON((57.633946 -20.484767, 57.633639 -20.482776, 57.633626 -20.482629, 57.633973 -20.482572, 57.634340 -20.482596, 57.634688 -20.482620, 57.635038 -20.482641, 57.635399 -20.482705, 57.635743 -20.482807, 57.636080 -20.482925, 57.636270 -20.482998, 57.636510 -20.483135, 57.636788 -20.483287, 57.636854 -20.483340, 57.636863 -20.483447, 57.637017 -20.484268, 57.637019 -20.484293, 57.636887 -20.484317, 57.635881 -20.484471, 57.633946 -20.484767))' },
  { id: 'field13', name: 'Bloc 5890', area: 22.15, wkt: 'POLYGON((57.634296 -20.486793, 57.634328 -20.486831, 57.634422 -20.486844, 57.637362 -20.486396, 57.637386 -20.486374, 57.637029 -20.484366, 57.635641 -20.484540, 57.633969 -20.484836, 57.634296 -20.486793))' },
  { id: 'field14', name: 'Bloc 5345', area: 19.67, wkt: 'POLYGON((57.632881 -20.482280, 57.633620 -20.480107, 57.633615 -20.480026, 57.632911 -20.479783, 57.632755 -20.480230, 57.632504 -20.480957, 57.632150 -20.482011, 57.632149 -20.482055, 57.632172 -20.482092, 57.632204 -20.482110, 57.632865 -20.482283, 57.632881 -20.482280))' },
  { id: 'field15', name: 'Bloc 5678', area: 26.89, wkt: 'POLYGON((57.631761 -20.483199, 57.632115 -20.482155, 57.633718 -20.482521, 57.633553 -20.482572, 57.633434 -20.482586, 57.632946 -20.482688, 57.632601 -20.482797, 57.632275 -20.482940, 57.631981 -20.483066, 57.631761 -20.483199))' },
  { id: 'field16', name: 'Bloc 5901', area: 33.12, wkt: 'POLYGON((57.631016 -20.483842, 57.631162 -20.484197, 57.631252 -20.484434, 57.631399 -20.484832, 57.631574 -20.485300, 57.631800 -20.485859, 57.631841 -20.485895, 57.632565 -20.486202, 57.633431 -20.486540, 57.634150 -20.486836, 57.634195 -20.486830, 57.634190 -20.486756, 57.633953 -20.485257, 57.633821 -20.484589, 57.633520 -20.482639, 57.633415 -20.482644, 57.632944 -20.482748, 57.632546 -20.482884, 57.631997 -20.483136, 57.631737 -20.483287, 57.631654 -20.483342, 57.631456 -20.483448, 57.631240 -20.483610, 57.631141 -20.483705, 57.631016 -20.483842))' },
  { id: 'field17', name: 'Bloc 5456', area: 17.34, wkt: 'POLYGON((57.630121 -20.485151, 57.630195 -20.485116, 57.630328 -20.485079, 57.630386 -20.485027, 57.630383 -20.484886, 57.630340 -20.484709, 57.630355 -20.484621, 57.630423 -20.484513, 57.630490 -20.484379, 57.630635 -20.484209, 57.630792 -20.484047, 57.630961 -20.483890, 57.630990 -20.483904, 57.631100 -20.484153, 57.631221 -20.484489, 57.631737 -20.485851, 57.631560 -20.485771, 57.630121 -20.485151))' },
  { id: 'field18', name: 'Bloc 5789', area: 24.56, wkt: 'POLYGON((57.632349 -20.487218, 57.632368 -20.487298, 57.632405 -20.487409, 57.632419 -20.487528, 57.632436 -20.487687, 57.632435 -20.487778, 57.632460 -20.487942, 57.632492 -20.488077, 57.632530 -20.488248, 57.632562 -20.488314, 57.632585 -20.488335, 57.634585 -20.489101, 57.634536 -20.488764, 57.634500 -20.488476, 57.634335 -20.487494, 57.634264 -20.487131, 57.634188 -20.487065, 57.634103 -20.486983, 57.633588 -20.487041, 57.632349 -20.487218))' },
  { id: 'field19', name: 'Bloc 5012', area: 21.78, wkt: 'POLYGON((57.631863 -20.485983, 57.631959 -20.486275, 57.632299 -20.487134, 57.632335 -20.487149, 57.632402 -20.487157, 57.634070 -20.486928, 57.634088 -20.486910, 57.634080 -20.486890, 57.632852 -20.486399, 57.631863 -20.485983))' },
  { id: 'field20', name: 'Bloc 5345', area: 29.90, wkt: 'POLYGON((57.632230 -20.487177, 57.632209 -20.487062, 57.631980 -20.486452, 57.631790 -20.485959, 57.631043 -20.485638, 57.630043 -20.485224, 57.629979 -20.485205, 57.629951 -20.485263, 57.629832 -20.485543, 57.629768 -20.485757, 57.629726 -20.485978, 57.629676 -20.486247, 57.629626 -20.486618, 57.629624 -20.486982, 57.629644 -20.487452, 57.629672 -20.487493, 57.629723 -20.487511, 57.629807 -20.487510, 57.631229 -20.487313, 57.632230 -20.487177))' },
  { id: 'field21', name: 'Bloc 5678', area: 16.23, wkt: 'POLYGON((57.629675 -20.487567, 57.629787 -20.487567, 57.632270 -20.487224, 57.632307 -20.487291, 57.632362 -20.487483, 57.632381 -20.487850, 57.632415 -20.488028, 57.632471 -20.488264, 57.632496 -20.488437, 57.632483 -20.488556, 57.632458 -20.488671, 57.632381 -20.488923, 57.632176 -20.489405, 57.631686 -20.490556, 57.631499 -20.490475, 57.631327 -20.490351, 57.631053 -20.490105, 57.630824 -20.489899, 57.630616 -20.489670, 57.630389 -20.489326, 57.630073 -20.488731, 57.629989 -20.488581, 57.629793 -20.488143, 57.629722 -20.488021, 57.629664 -20.487650, 57.629675 -20.487567))' },
  { id: 'field22', name: 'Bloc 5901', area: 27.45, wkt: 'POLYGON((57.631678 -20.475554, 57.631984 -20.474471, 57.634277 -20.475115, 57.634312 -20.475203, 57.633990 -20.476228, 57.631694 -20.475589, 57.631678 -20.475554))' },
  { id: 'field23', name: 'Bloc 5234', area: 23.67, wkt: 'POLYGON((57.627592 -20.475860, 57.627400 -20.475817, 57.627329 -20.475826, 57.627285 -20.475902, 57.627291 -20.475976, 57.627698 -20.476885, 57.627894 -20.477132, 57.629004 -20.477445, 57.629695 -20.477616, 57.629709 -20.477570, 57.629282 -20.476331, 57.629238 -20.476299, 57.627592 -20.475860))' },
  { id: 'field24', name: 'Bloc 5567', area: 20.89, wkt: 'POLYGON((57.627212 -20.474463, 57.627112 -20.474508, 57.626979 -20.474601, 57.626954 -20.474687, 57.626945 -20.474812, 57.626976 -20.475196, 57.627021 -20.475358, 57.627140 -20.475646, 57.627251 -20.475725, 57.627497 -20.475798, 57.628300 -20.476003, 57.629117 -20.476214, 57.629228 -20.476228, 57.629263 -20.476190, 57.629582 -20.475146, 57.629573 -20.475096, 57.628954 -20.474936, 57.627511 -20.474547, 57.627212 -20.474463))' },
  { id: 'field25', name: 'Bloc 5890', area: 25.12, wkt: 'POLYGON((57.633528 -20.477380, 57.633600 -20.477382, 57.633639 -20.477351, 57.633955 -20.476363, 57.633930 -20.476297, 57.632889 -20.475994, 57.631951 -20.475745, 57.630736 -20.475397, 57.629798 -20.475157, 57.629693 -20.475154, 57.629643 -20.475204, 57.629382 -20.475921, 57.629339 -20.476120, 57.629357 -20.476253, 57.630495 -20.476585, 57.631423 -20.476796, 57.631562 -20.476782, 57.631716 -20.476759, 57.631811 -20.476759, 57.631897 -20.476799, 57.632023 -20.476907, 57.632208 -20.476997, 57.632356 -20.477061, 57.632601 -20.477134, 57.633528 -20.477380))' },
  { id: 'field26', name: 'Bloc 5123', area: 32.34, wkt: 'POLYGON((57.633595 -20.477473, 57.633241 -20.478539, 57.633199 -20.478565, 57.632275 -20.478321, 57.630588 -20.477852, 57.629868 -20.477664, 57.629809 -20.477627, 57.629415 -20.476509, 57.629381 -20.476420, 57.629421 -20.476357, 57.629498 -20.476360, 57.631379 -20.476862, 57.632593 -20.477195, 57.633595 -20.477473))' },
  { id: 'field27', name: 'Bloc 5456', area: 18.56, wkt: 'POLYGON((57.630159 -20.478884, 57.630025 -20.478474, 57.629762 -20.477701, 57.628893 -20.477474, 57.627967 -20.477208, 57.628006 -20.477267, 57.628681 -20.477934, 57.629228 -20.478547, 57.629390 -20.478737, 57.629655 -20.478808, 57.630108 -20.478907, 57.630159 -20.478884))' },
  { id: 'field28', name: 'Bloc 5789', area: 24.78, wkt: 'POLYGON((57.632907 -20.479528, 57.632869 -20.479640, 57.632805 -20.479647, 57.631925 -20.479402, 57.630432 -20.478995, 57.630274 -20.478952, 57.630018 -20.478238, 57.629850 -20.477719, 57.629893 -20.477723, 57.631862 -20.478263, 57.633202 -20.478620, 57.632907 -20.479528))' },
  { id: 'field29', name: 'Bloc 5012', area: 21.90, wkt: 'POLYGON((57.629413 -20.478825, 57.629506 -20.479070, 57.629587 -20.479355, 57.629629 -20.479594, 57.629634 -20.479841, 57.629605 -20.480031, 57.629519 -20.480178, 57.629461 -20.480302, 57.629466 -20.480532, 57.629480 -20.480783, 57.629523 -20.481013, 57.629575 -20.481202, 57.629618 -20.481237, 57.630245 -20.481386, 57.630348 -20.481401, 57.630377 -20.481359, 57.630356 -20.481285, 57.630320 -20.481087, 57.630300 -20.480431, 57.630281 -20.479636, 57.630219 -20.479061, 57.630194 -20.478990, 57.629512 -20.478820, 57.629422 -20.478814, 57.629413 -20.478825))' },
  { id: 'field30', name: 'Bloc 5345', area: 28.12, wkt: 'POLYGON((57.647908 -20.481441, 57.647824 -20.481388, 57.647822 -20.481329, 57.648869 -20.479964, 57.648913 -20.479940, 57.649154 -20.480040, 57.649249 -20.480116, 57.649256 -20.480166, 57.648968 -20.480630, 57.648591 -20.481301, 57.648453 -20.481521, 57.648368 -20.481604, 57.648269 -20.481629, 57.647908 -20.481441))' },
  { id: 'field31', name: 'Bloc 5678', area: 15.34, wkt: 'POLYGON((57.647739 -20.481344, 57.647690 -20.481349, 57.646994 -20.480953, 57.647707 -20.479855, 57.647970 -20.479448, 57.648009 -20.479411, 57.648057 -20.479430, 57.648665 -20.479783, 57.648807 -20.479880, 57.648830 -20.479920, 57.648379 -20.480521, 57.647739 -20.481344))' },
  { id: 'field32', name: 'Bloc 5901', area: 26.56, wkt: 'POLYGON((57.646998 -20.481033, 57.646943 -20.481036, 57.646388 -20.481835, 57.645688 -20.482889, 57.645421 -20.483310, 57.645371 -20.483423, 57.645391 -20.483458, 57.645827 -20.483738, 57.645910 -20.483738, 57.646434 -20.483053, 57.646750 -20.482729, 57.647050 -20.482276, 57.647199 -20.482122, 57.647667 -20.481450, 57.647668 -20.481404, 57.647620 -20.481364, 57.646998 -20.481033))' },
  { id: 'field33', name: 'Bloc 5234', area: 22.78, wkt: 'POLYGON((57.646223 -20.480585, 57.646178 -20.480547, 57.646135 -20.480546, 57.645485 -20.481479, 57.645160 -20.481984, 57.645013 -20.482174, 57.644655 -20.482703, 57.644518 -20.482913, 57.644835 -20.483102, 57.644922 -20.483123, 57.645304 -20.483388, 57.645832 -20.482595, 57.646864 -20.481050, 57.646881 -20.480981, 57.646853 -20.480949, 57.646223 -20.480585))' },
  { id: 'field34', name: 'Bloc 5567', area: 19.90, wkt: 'POLYGON((57.644462 -20.482856, 57.643856 -20.482498, 57.643842 -20.482443, 57.644562 -20.481337, 57.645207 -20.480397, 57.645391 -20.480127, 57.645422 -20.480111, 57.645466 -20.480121, 57.646059 -20.480472, 57.646083 -20.480504, 57.645457 -20.481452, 57.644928 -20.482227, 57.644497 -20.482852, 57.644481 -20.482871, 57.644462 -20.482856))' },
  { id: 'field35', name: 'Bloc 5890', area: 24.12, wkt: 'POLYGON((57.647214 -20.478988, 57.647160 -20.478992, 57.647086 -20.479063, 57.646544 -20.479890, 57.646192 -20.480436, 57.646177 -20.480475, 57.646209 -20.480508, 57.646890 -20.480898, 57.646931 -20.480913, 57.646982 -20.480876, 57.647607 -20.479895, 57.647930 -20.479418, 57.647943 -20.479372, 57.647214 -20.478988))' },
  { id: 'field36', name: 'Bloc 5123', area: 31.34, wkt: 'POLYGON((57.646421 -20.478566, 57.646385 -20.478590, 57.645461 -20.479989, 57.645443 -20.480053, 57.645496 -20.480092, 57.646125 -20.480444, 57.647089 -20.478979, 57.647106 -20.478930, 57.647045 -20.478895, 57.646421 -20.478566))' },
  { id: 'field37', name: 'Bloc 5456', area: 17.56, wkt: 'POLYGON((57.646119 -20.478381, 57.646023 -20.478444, 57.645682 -20.478997, 57.645596 -20.478974, 57.645502 -20.479014, 57.645406 -20.479168, 57.645342 -20.479142, 57.645055 -20.479504, 57.644797 -20.479359, 57.644156 -20.480080, 57.643676 -20.480638, 57.643303 -20.481014, 57.642992 -20.481321, 57.642831 -20.481512, 57.642758 -20.481615, 57.642756 -20.481708, 57.642834 -20.481801, 57.642914 -20.481881, 57.643729 -20.482411, 57.643771 -20.482420, 57.644046 -20.482031, 57.644137 -20.481850, 57.644601 -20.481168, 57.644813 -20.480827, 57.645434 -20.479880, 57.645972 -20.479036, 57.646221 -20.478681, 57.646306 -20.478546, 57.646298 -20.478499, 57.646262 -20.478470, 57.646119 -20.478381))' },
  { id: 'field38', name: 'Bloc 5789', area: 23.78, wkt: 'POLYGON((57.642182 -20.481105, 57.642166 -20.481148, 57.642681 -20.481462, 57.642748 -20.481486, 57.643303 -20.480910, 57.643696 -20.480512, 57.644491 -20.479585, 57.644985 -20.479008, 57.644971 -20.478969, 57.644281 -20.478583, 57.644197 -20.478588, 57.644122 -20.478651, 57.643285 -20.479717, 57.642665 -20.480504, 57.642182 -20.481105))' },
  { id: 'field39', name: 'Bloc 5012', area: 20.90, wkt: 'POLYGON((57.639502 -20.476765, 57.639463 -20.476772, 57.639148 -20.476589, 57.638868 -20.476449, 57.638731 -20.476370, 57.639673 -20.475214, 57.640326 -20.474415, 57.641138 -20.473353, 57.641247 -20.473380, 57.641822 -20.473598, 57.641947 -20.473641, 57.641255 -20.474524, 57.640629 -20.475322, 57.639933 -20.476224, 57.639502 -20.476765))' },
  { id: 'field40', name: 'Bloc 5345', area: 27.12, wkt: 'POLYGON((57.639542 -20.476858, 57.639553 -20.476934, 57.639569 -20.476995, 57.639669 -20.477071, 57.639871 -20.477156, 57.639970 -20.477164, 57.640052 -20.477189, 57.640110 -20.477213, 57.640137 -20.477254, 57.640205 -20.477297, 57.640273 -20.477308, 57.641242 -20.476078, 57.642018 -20.475072, 57.642025 -20.475022, 57.642012 -20.474976, 57.641415 -20.474621, 57.641323 -20.474593, 57.641258 -20.474642, 57.640409 -20.475748, 57.639922 -20.476373, 57.639542 -20.476858))' }
]

// Realistic Mauritius sugarcane operation types with detailed resource requirements
export const OPERATION_TYPES = [
  {
    type: 'land_preparation',
    name: 'Land Preparation',
    cost_per_hectare: 15000,
    duration_days: 2,
    method: 'mechanical',
    equipment: ['tractor-large', 'plow', 'disc-harrow'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 6, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 4, rate_per_hour: 45 }
    ],
    products: []
  },
  {
    type: 'planting',
    name: 'Sugarcane Planting',
    cost_per_hectare: 25000,
    duration_days: 3,
    method: 'mechanical',
    equipment: ['tractor-medium', 'planter'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 8, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 12, rate_per_hour: 45 },
      { type: 'supervisor', hours_per_hectare: 2, rate_per_hour: 120 }
    ],
    products: []
  },
  {
    type: 'fertilization',
    name: 'Fertilization',
    cost_per_hectare: 18000,
    duration_days: 1,
    method: 'mechanical',
    equipment: ['tractor-medium', 'fertilizer-spreader'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 3, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'npk-12-12-17', name: '12:12:17 NPK', kg_per_hectare: 400, cost_per_kg: 38 },
      { id: 'npk-20-20-20', name: '20:20:20 NPK', kg_per_hectare: 200, cost_per_kg: 52 },
      { id: 'urea', name: 'Urea 46%', kg_per_hectare: 150, cost_per_kg: 35.75 }
    ]
  },
  {
    type: 'weed_control',
    name: 'Weed Control',
    cost_per_hectare: 12000,
    duration_days: 1,
    method: 'chemical',
    equipment: ['tractor-small', 'sprayer'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 4, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'glyphosate', name: 'Glyphosate 41%', liters_per_hectare: 3, cost_per_liter: 85 }
    ]
  },
  {
    type: 'pest_control',
    name: 'Pest Control',
    cost_per_hectare: 8000,
    duration_days: 1,
    method: 'chemical',
    equipment: ['tractor-small', 'sprayer'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 3, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'cypermethrin', name: 'Cypermethrin 10%', liters_per_hectare: 1.5, cost_per_liter: 125 }
    ]
  },
  {
    type: 'irrigation',
    name: 'Irrigation',
    cost_per_hectare: 5000,
    duration_days: 1,
    method: 'manual',
    equipment: ['pump', 'irrigation-pipes'],
    labour: [
      { type: 'field-worker', hours_per_hectare: 6, rate_per_hour: 45 }
    ],
    products: []
  },
  {
    type: 'harvesting',
    name: 'Harvesting',
    cost_per_hectare: 35000,
    duration_days: 5,
    method: 'manual',
    equipment: ['cane-loader', 'field-trailer'],
    labour: [
      { type: 'seasonal-worker', hours_per_hectare: 40, rate_per_hour: 30 },
      { type: 'machine-operator', hours_per_hectare: 8, rate_per_hour: 75 },
      { type: 'supervisor', hours_per_hectare: 5, rate_per_hour: 120 }
    ],
    products: []
  }
]

// Helper functions for date calculations
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Generate crop cycle based on variety and current date
function generateCropCycle(blocId: string, variety: any, cycleType: 'plantation' | 'ratoon', cycleNumber: number) {
  const today = new Date('2025-07-20') // Demo date
  const plantingDate = new Date(today)
  
  // Adjust planting date based on cycle type and number
  if (cycleType === 'plantation') {
    plantingDate.setMonth(plantingDate.getMonth() - Math.floor(Math.random() * variety.maturity_months))
  } else {
    // Ratoon cycles start after previous harvest
    plantingDate.setMonth(plantingDate.getMonth() - Math.floor(Math.random() * (variety.maturity_months - 2)))
  }
  
  const harvestDate = addMonths(plantingDate, variety.maturity_months)
  const isActive = harvestDate > today
  
  return {
    id: `cycle-${blocId}-${cycleNumber}`,
    bloc_id: blocId,
    type: cycleType,
    cycle_number: cycleNumber,
    status: isActive ? 'active' : 'closed',
    sugarcane_variety_id: variety.id,
    intercrop_variety_id: null,
    planting_date: formatDate(plantingDate),
    planned_harvest_date: formatDate(harvestDate),
    actual_harvest_date: isActive ? null : formatDate(harvestDate),
    expected_yield_tons_ha: variety.yield_potential + Math.floor(Math.random() * 20) - 10,
    actual_yield_tons_ha: isActive ? null : variety.yield_potential + Math.floor(Math.random() * 15) - 7,
    estimated_total_cost: Math.floor(Math.random() * 50000) + 100000, // 100k-150k MUR
    actual_total_cost: isActive ? null : Math.floor(Math.random() * 45000) + 95000,
    total_revenue: isActive ? null : Math.floor(Math.random() * 100000) + 200000,
    sugarcane_revenue: isActive ? null : Math.floor(Math.random() * 95000) + 190000,
    intercrop_revenue: null,
    profit_loss: null,
    created_at: formatDate(plantingDate),
    updated_at: new Date().toISOString()
  }
}

// Generate field operations based on crop cycle stage
function generateFieldOperations(cropCycle: any, blocArea: number) {
  const operations: any[] = []
  const plantingDate = new Date(cropCycle.planting_date)
  const today = new Date('2025-07-20')
  const daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))

  // Determine which operations should have occurred by now
  const operationSchedule = [
    { type: 'land_preparation', daysAfterPlanting: -7, status: 'completed' },
    { type: 'planting', daysAfterPlanting: 0, status: 'completed' },
    { type: 'fertilization', daysAfterPlanting: 30, status: daysSincePlanting > 30 ? 'completed' : 'planned' },
    { type: 'weed_control', daysAfterPlanting: 60, status: daysSincePlanting > 60 ? 'completed' : 'planned' },
    { type: 'fertilization', daysAfterPlanting: 120, status: daysSincePlanting > 120 ? 'completed' : 'planned' },
    { type: 'pest_control', daysAfterPlanting: 180, status: daysSincePlanting > 180 ? 'completed' : 'planned' },
    { type: 'weed_control', daysAfterPlanting: 240, status: daysSincePlanting > 240 ? 'completed' : 'planned' },
    { type: 'irrigation', daysAfterPlanting: 300, status: daysSincePlanting > 300 ? 'completed' : 'planned' },
    { type: 'harvesting', daysAfterPlanting: cropCycle.type === 'plantation' ? 540 : 365, status: 'planned' }
  ]

  operationSchedule.forEach((schedule, index) => {
    const operationType = OPERATION_TYPES.find(op => op.type === schedule.type)
    if (!operationType) return

    const operationDate = addDays(plantingDate, schedule.daysAfterPlanting)
    const endDate = addDays(operationDate, operationType.duration_days)

    // Check if this is a harvesting operation and should be in progress
    let status = schedule.status
    if (schedule.type === 'harvesting' && daysSincePlanting > schedule.daysAfterPlanting - 30) {
      status = 'in-progress' // Harvesting operations currently in progress
    }

    // Calculate costs based on detailed resource requirements
    const productCost = operationType.products.reduce((sum, product: any) => {
      const quantity = product.kg_per_hectare || product.liters_per_hectare || 0
      const cost = product.cost_per_kg || product.cost_per_liter || 0
      return sum + (quantity * cost * blocArea)
    }, 0)

    const labourCost = operationType.labour.reduce((sum, labour) => {
      return sum + (labour.hours_per_hectare * labour.rate_per_hour * blocArea)
    }, 0)

    const equipmentCost = operationType.equipment.length * 200 * blocArea // Estimated equipment cost
    const estimatedCost = Math.floor(productCost + labourCost + equipmentCost)
    const actualCost = status === 'completed' ? Math.floor(estimatedCost * (0.9 + Math.random() * 0.2)) : null

    operations.push({
      uuid: `op-${cropCycle.id}-${index}`,
      crop_cycle_uuid: cropCycle.id,
      operation_name: operationType.name,
      operation_type: schedule.type,
      method: operationType.method,
      priority: schedule.type === 'harvesting' ? 'high' : 'normal',
      planned_start_date: formatDate(operationDate),
      planned_end_date: formatDate(endDate),
      actual_start_date: status === 'completed' || status === 'in-progress' ? formatDate(operationDate) : null,
      actual_end_date: status === 'completed' ? formatDate(endDate) : null,
      planned_area_hectares: blocArea,
      actual_area_hectares: status === 'completed' ? blocArea : status === 'in-progress' ? blocArea * 0.6 : null,
      planned_quantity: null,
      actual_quantity: null,
      status: status,
      completion_percentage: status === 'completed' ? 100 : status === 'in-progress' ? 60 : 0,
      estimated_total_cost: estimatedCost,
      actual_total_cost: actualCost,
      actual_revenue: null,
      total_yield: null,
      yield_per_hectare: null,
      quality_metrics: null,
      weather_conditions: null,
      notes: null,
      // Add resource details
      products: operationType.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        planned_quantity: (product.kg_per_hectare || product.liters_per_hectare || 0) * blocArea,
        actual_quantity: status === 'completed' ? (product.kg_per_hectare || product.liters_per_hectare || 0) * blocArea * (0.95 + Math.random() * 0.1) : null,
        unit: product.kg_per_hectare ? 'kg' : 'L',
        planned_cost: (product.kg_per_hectare || product.liters_per_hectare || 0) * (product.cost_per_kg || product.cost_per_liter || 0) * blocArea,
        actual_cost: status === 'completed' ? (product.kg_per_hectare || product.liters_per_hectare || 0) * (product.cost_per_kg || product.cost_per_liter || 0) * blocArea * (0.95 + Math.random() * 0.1) : null
      })),
      equipment: operationType.equipment.map((equipmentId: any) => ({
        id: equipmentId,
        name: equipmentId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        planned_hours: operationType.duration_days * 8,
        actual_hours: status === 'completed' ? operationType.duration_days * 8 * (0.9 + Math.random() * 0.2) : null,
        cost_per_hour: 200 + Math.random() * 300,
        planned_cost: operationType.duration_days * 8 * (200 + Math.random() * 300),
        actual_cost: status === 'completed' ? operationType.duration_days * 8 * (200 + Math.random() * 300) * (0.9 + Math.random() * 0.2) : null
      })),
      labour: operationType.labour.map((labour: any) => ({
        id: labour.type,
        name: labour.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        planned_hours: labour.hours_per_hectare * blocArea,
        actual_hours: status === 'completed' ? labour.hours_per_hectare * blocArea * (0.9 + Math.random() * 0.2) : null,
        rate_per_hour: labour.rate_per_hour,
        planned_cost: labour.hours_per_hectare * labour.rate_per_hour * blocArea,
        actual_cost: status === 'completed' ? labour.hours_per_hectare * labour.rate_per_hour * blocArea * (0.9 + Math.random() * 0.2) : null
      })),
      created_at: formatDate(operationDate),
      updated_at: new Date().toISOString()
    })
  })

  return operations
}

// Generate work packages for each operation
function generateWorkPackages(operation: any) {
  const workPackages: any[] = []
  const startDate = new Date(operation.planned_start_date)
  const endDate = new Date(operation.planned_end_date)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Create daily work packages
  for (let day = 0; day < daysDiff; day++) {
    const workDate = addDays(startDate, day)
    const isCompleted = operation.status === 'completed' ||
                       (operation.status === 'in-progress' && day < daysDiff * 0.6)

    const plannedArea = operation.planned_area_hectares / daysDiff
    const actualArea = isCompleted ? plannedArea * (0.9 + Math.random() * 0.2) : null

    const estimatedCost = operation.estimated_total_cost / daysDiff
    const actualCost = isCompleted ? estimatedCost * (0.9 + Math.random() * 0.2) : null

    workPackages.push({
      uuid: `wp-${operation.uuid}-${day}`,
      field_operation_uuid: operation.uuid,
      package_name: `${operation.operation_name} - Day ${day + 1}`,
      work_date: formatDate(workDate),
      shift: 'day',
      planned_area_hectares: plannedArea,
      actual_area_hectares: actualArea,
      planned_quantity: null,
      actual_quantity: null,
      status: isCompleted ? 'completed' : operation.status === 'in-progress' ? 'in-progress' : 'not-started',
      start_time: '08:00',
      end_time: '17:00',
      duration_hours: isCompleted ? 8 + Math.floor(Math.random() * 2) : null,
      weather_conditions: isCompleted ? ['sunny', 'partly_cloudy', 'overcast'][Math.floor(Math.random() * 3)] : null,
      temperature_celsius: isCompleted ? 25 + Math.floor(Math.random() * 10) : null,
      humidity_percent: isCompleted ? 60 + Math.floor(Math.random() * 30) : null,
      wind_speed_kmh: isCompleted ? Math.floor(Math.random() * 20) : null,
      rainfall_mm: isCompleted && Math.random() > 0.8 ? Math.floor(Math.random() * 10) : null,
      soil_conditions: isCompleted ? ['dry', 'moist', 'wet'][Math.floor(Math.random() * 3)] : null,
      estimated_cost: estimatedCost,
      actual_cost: actualCost,
      // Add resource details for work packages
      products: operation.products ? operation.products.map((product: any) => ({
        ...product,
        actual_quantity: isCompleted ? product.planned_quantity * (0.95 + Math.random() * 0.1) / daysDiff : null,
        actual_cost: isCompleted ? product.planned_cost * (0.95 + Math.random() * 0.1) / daysDiff : null
      })) : [],
      equipment: operation.equipment ? operation.equipment.map((equipment: any) => ({
        ...equipment,
        actual_hours: isCompleted ? equipment.planned_hours * (0.9 + Math.random() * 0.2) / daysDiff : null,
        actual_cost: isCompleted ? equipment.planned_cost * (0.9 + Math.random() * 0.2) / daysDiff : null
      })) : [],
      labour: operation.labour ? operation.labour.map((labour: any) => ({
        ...labour,
        actual_hours: isCompleted ? labour.planned_hours * (0.9 + Math.random() * 0.2) / daysDiff : null,
        actual_cost: isCompleted ? labour.planned_cost * (0.9 + Math.random() * 0.2) / daysDiff : null
      })) : [],
      notes: null,
      created_at: formatDate(workDate),
      updated_at: new Date().toISOString()
    })
  }

  return workPackages
}

// Main function to generate complete demo data
export function generateCompleteMauritiusDemoData() {
  const farms = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Omnicane Estate - North',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Omnicane Estate - South',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const blocs: any[] = []
  const cropCycles: any[] = []
  const fieldOperations: any[] = []
  const workPackages: any[] = []

  // Generate 40 blocs with complete data
  CSV_FIELD_POLYGONS.forEach((field, index) => {
    const blocId = `550e8400-e29b-41d4-a716-44665544${String(index + 10).padStart(4, '0')}`
    const farmId = index < 20 ? farms[0].id : farms[1].id
    const variety = MAURITIUS_VARIETIES[index % MAURITIUS_VARIETIES.length]

    // Create bloc with exact polygon coordinates from CSV
    // 1st bloc gets CSV row 1 polygon, 2nd bloc gets CSV row 2 polygon, etc.
    const parsedCoordinates = parseWKTToCoordinates(field.wkt)

    console.log(`🔍 Creating bloc ${field.name}:`)
    console.log(`   WKT: ${field.wkt.substring(0, 80)}...`)
    console.log(`   Parsed coordinates count: ${parsedCoordinates.length}`)
    console.log(`   First coordinate: [${parsedCoordinates[0]?.[0]}, ${parsedCoordinates[0]?.[1]}]`)

    // Validate coordinates
    if (parsedCoordinates.length === 0) {
      console.error(`❌ CRITICAL: No coordinates parsed for ${field.name}!`)
      console.error(`   WKT: ${field.wkt}`)
    } else {
      const isSquare = parsedCoordinates.length === 5 &&
                       parsedCoordinates[0] && parsedCoordinates[1] && parsedCoordinates[2] && parsedCoordinates[3] &&
                       Math.abs(parsedCoordinates[0][0] - parsedCoordinates[3][0]) < 0.001 &&
                       Math.abs(parsedCoordinates[1][1] - parsedCoordinates[2][1]) < 0.001

      console.log(`   Is square: ${isSquare}`)

      if (isSquare) {
        console.error(`❌ CRITICAL: ${field.name} parsed as square! This should not happen with real CSV data.`)
      } else {
        console.log(`   ✅ ${field.name} parsed as irregular polygon (correct)`)
      }
    }

    const bloc = {
      id: blocId,
      name: field.name, // Bloc name (e.g., "Bloc 5316")
      area_hectares: field.area,
      coordinates_wkt: field.wkt, // Exact WKT from CSV
      coordinates: parsedCoordinates, // Pre-parsed coordinates for performance
      status: 'active',
      farm_id: farmId,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    // Validate bloc object before adding
    if (!bloc.coordinates || bloc.coordinates.length === 0) {
      console.error(`❌ CRITICAL: Bloc ${field.name} has no coordinates!`, bloc)
    } else {
      console.log(`   ✅ Bloc ${field.name} created successfully with ${bloc.coordinates.length} coordinates`)
    }

    blocs.push(bloc)

    // Generate crop cycles (current + historical)
    const currentCycleType = Math.random() > 0.3 ? 'ratoon' : 'plantation'
    const currentCycleNumber = currentCycleType === 'plantation' ? 1 : Math.floor(Math.random() * 4) + 2

    // Current active cycle
    const currentCycle = generateCropCycle(blocId, variety, currentCycleType, currentCycleNumber)
    cropCycles.push(currentCycle)

    // Generate historical cycles if this is a ratoon
    if (currentCycleType === 'ratoon') {
      for (let i = 1; i < currentCycleNumber; i++) {
        const historicalType = i === 1 ? 'plantation' : 'ratoon'
        const historicalCycle = generateCropCycle(blocId, variety, historicalType, i)
        historicalCycle.status = 'closed'
        historicalCycle.actual_harvest_date = historicalCycle.planned_harvest_date
        historicalCycle.actual_yield_tons_ha = variety.yield_potential + Math.floor(Math.random() * 15) - 7
        historicalCycle.actual_total_cost = Math.floor(Math.random() * 45000) + 95000
        historicalCycle.total_revenue = Math.floor(Math.random() * 100000) + 200000
        historicalCycle.sugarcane_revenue = Math.floor(Math.random() * 95000) + 190000
        cropCycles.push(historicalCycle)
      }
    }

    // Generate field operations for current cycle
    const operations = generateFieldOperations(currentCycle, field.area)
    fieldOperations.push(...operations)

    // Generate work packages for each operation
    operations.forEach(operation => {
      const packages = generateWorkPackages(operation)
      workPackages.push(...packages)
    })
  })

  // Ensure 4 blocs are currently harvesting
  const harvestingOperations = fieldOperations.filter(op => op.operation_type === 'harvesting')
  for (let i = 0; i < Math.min(4, harvestingOperations.length); i++) {
    harvestingOperations[i].status = 'in-progress'
    harvestingOperations[i].completion_percentage = 40 + Math.floor(Math.random() * 40)
    harvestingOperations[i].actual_start_date = harvestingOperations[i].planned_start_date
    harvestingOperations[i].actual_area_hectares = harvestingOperations[i].planned_area_hectares * 0.6
  }



  return {
    version: '2.0.0',
    farms,
    blocs,
    cropCycles,
    fieldOperations,
    workPackages,
    products: [], // Will be filled from existing data
    labour: [], // Will be filled from existing data
    equipment: [], // Will be filled from existing data
    sugarcaneVarieties: MAURITIUS_VARIETIES,
    intercropVarieties: [],
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Force regenerate all demo data and clear cache
 * Use this when field polygon data has been updated
 */
export function forceRegenerateData() {
  // Clear all cached data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mauritius-demo-farms')
    localStorage.removeItem('mauritius-demo-blocs')
    localStorage.removeItem('mauritius-demo-crop-cycles')
    localStorage.removeItem('mauritius-demo-field-operations')
    localStorage.removeItem('mauritius-demo-work-packages')
    localStorage.removeItem('demo-data-timestamp')

    console.log('🔄 Cleared all cached demo data - will regenerate with new field polygons')
  }

  // Generate fresh data
  return generateCompleteMauritiusDemoData()
}
