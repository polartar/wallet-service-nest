import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class PublishVaultTransactionDto {
  @ApiProperty({
    description: 'serialized transaction body',
    default:
      '{\n  "type": 2,\n  "from": "0x3D1683a3Ff587F89388eAFC8381A7A0feE593ffe",\n  "to": "0x371398af172609f57f0F13Be4c1AAf48AcCEB59d",\n  "value": {\n      "value": "0.000001",\n      "factor": 0\n  },\n  "extra": {\n      "transferMessage": "remember",\n      "publicKey": "0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc",\n      "encodedDataMessage": "0x72656d656d626572"\n  },\n  "fee": {\n      "fee": {\n          "value": "0.0006637993703654",\n          "factor": 0\n      },\n      "extra": {\n          "gas": 21128,\n          "gasPrice": "31417993675"\n      }\n  },\n  "nativeTransaction": {\n      "nonce": "0x5",\n      "gasPrice": "0x750a889cb",\n      "gasLimit": "0x5288",\n      "to": "0x371398af172609f57f0f13be4c1aaf48acceb59d",\n      "value": "0xe8d4a51000",\n      "data": "0x72656d656d626572",\n      "chainId": 1\n  },\n  "signingPayloads": [\n      {\n          "address": "0x3D1683a3Ff587F89388eAFC8381A7A0feE593ffe",\n          "publickey": "0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc",\n          "tosign": "ba5da01af13f777a40eca8c36346c751af79935d601c8e0b7d815554de1b09d1"\n      }\n  ]\n}',
  })
  @IsNotEmpty()
  serializedTransaction: string

  @ApiProperty({
    description: 'parts',
    default: [
      'UR:BYTES/1-10/LPADBKCFAXIDCYJKCKFWAXHDHGHKAXHEKGCPKOIHJPJKINJLJTCPFTCPEHCPDWCPJYKKJOIHCPFTCPJYKSHEJKINIOJTCPDWCPJNIEECCPFTCPEHEEESENEMIHEEENIHIHENDYEYEOHSIAESECIYIHIEIAHSIDIEIDIAIDIYIEESECCPDWCPIEHSJYHSCPFTCPFDEEJKVYMEDMDE',
      'UR:BYTES/2-10/LPAOBKCFAXIDCYJKCKFWAXHDHGGAFPFPFPFPFPFPFPFPFEEMHFGHGHGODLIMGTFWFYESGRETIMJTHSJNHDFDJTDNJNJYGYGRKPJYESJEGTIAKPFGFEGWDLISINHDINGTHSJOJEISGUEHGYKOEOKOHSENIHJZGEFPFDEYJKGLGEHSINISGUGDHTESEMGTIHEOECDNGMIDLATDONSB',
      'UR:BYTES/3-10/LPAXBKCFAXIDCYJKCKFWAXHDHGHKJSKTJNESIEFPJOJSINIHIYJKFEGLIHKSGRGLFEFDGLJLGHGHHFGEJKHDKPKOETIAJYIDFYIDFGJYINEOJKKNHSECDNGUHTJEGLEYFLEOFLKSGHGWGEHTESIYGSGWETHSHGKTIAFEIHGHGYHGIHJLGSIDHGJLIEFLEYGSHSJPGYJLCHLUDNLF',
      'UR:BYTES/4-10/LPAABKCFAXIDCYJKCKFWAXHDHGGWJEFYIHJZEYFGJSENJKHFHSIOESIDHGGRFDJOHFGHHKECEMHDEHIEJZHGJNDLGYJTISGDIDEEJZGYHFGLGWFGECDYJLKPHFFEENHFIOJYJTINGMJZFGFGHTJTGRFLGDIAKSECGHJPEYGDESIHIYINJYJPJSGOGUJEGEKNJOGHEYGMLNAHFEFG',
      'UR:BYTES/5-10/LPAHBKCFAXIDCYJKCKFWAXHDHGJNIAFXECECESGSIMFWHSFDHDKTFXKKHTKNGHKSGHGTEOJKKNKODNHSECKPECGUDNENGTEYKPFLENGUIDGRENEHIHGSFXGEDNKTEYJNGMIADLEMJOEOFEIAENHFHTDYGUIAFPJLIHKNEHFXKTIMEHKSFDGOFWEHEMFYDLGOKOHSFWJSKIFHUYEM',
      'UR:BYTES/6-10/LPAMBKCFAXIDCYJKCKFWAXHDHGESGDJLGDHGGOFEGEJOJLFWENFPIDJTIEJNGOESIOIYIAFYIOEOKNJTGSKPKTFYFXINFXGTJNJKGLGHEMEOJTIMISKPFGIDFDFLFLGUIAHTKSKSGYGHEEGYINIMFDINKPJOHDHSHSEEINJLGTECKKFEHFJNKTFWIOEMGYGAIEIOGRKTKTDRRTEO',
      'UR:BYTES/7-10/LPATBKCFAXIDCYJKCKFWAXHDHGIYKPHFJPIEENGTFPJPIHGMENFLEEIAGLDYHDDLEYGUEYGYJTEHGWFDJKIDINIMFXGWIYGUKKHKFEJZHDJZGWGEHSHSFXJKESEEJEJTKTJSHKEHJPFEDLEMFPIAISGHDLFLEHIDIMJPGSGMFEHDGOECGTGDGMHDHFEOHKETKTINGOGTRORHDKAD',
      'UR:BYTES/8-10/LPAYBKCFAXIDCYJKCKFWAXHDHGGEGSHSFXETJZGDIEGSJLGWIYHFECFWJYETGOGSEOGSESEMIAETGYKKHFGTFGIHGEGWGAFYGRHKIHJYJLJLFPIAHSENHFKKHSETHTHTGDEEKPKKHSFXETHKJNHFGRFYISGSESENEHISGLJSJEJNIHEHIMJOEMHFEHJLGEECESDNKSFDTEFHNEVW',
      'UR:BYTES/9-10/LPASBKCFAXIDCYJKCKFWAXHDHGKTIYIHIOFDGLGWIAGMGLDYFDGWGUEMIHESJYIYHDEOFEKPDYGHEMJLGAGUECIEKKGUHFDNJZJOJZINFDGAJSKNKOESFLFGGHHSIEIHGEDLDLFWHGGLIDJLIDEMHFKTIEIMIYHGGDGHDLIOIEECDLGYGTJTKODLGSGTEOIOGHGDJYFEMDLRWNDL',
      'UR:BYTES/10-10/LPBKBKCFAXIDCYJKCKFWAXHDHGENKTGMKOGLJTIAHKJEHSJEDNESJZFGGAKNFYFGHKJPGUKTHFJZKTJEJLIHFYECGRGLKPFWGWHKHGFPHDHKGUGRIAGAECECKTECGAFPIDJTIMJLKNIAESIDIOGRGMDLGMEEDLFPGLHGKKGLEEKKGMIOGOFPFPFPFSFSCPKIAEAEAEAEWPNLWNOS',
      'UR:BYTES/11-10/LPBDBKCFAXIDCYJKCKFWAXHDHGIYKPHFJPIEENGTFPJPIHGMENFLEEIAGLDYHDDLEYGUEYGYJTEHGWFDJKIDINIMFXGWIYGUKKHKFEJZHDJZGWGEHSHSFXJKESEEJEJTKTJSHKEHJPFEDLEMFPIAISGHDLFLEHIDIMJPGSGMFEHDGOECGTGDGMHDHFEOHKETKTINGOGTCACNETNE',
      'UR:BYTES/12-10/LPBNBKCFAXIDCYJKCKFWAXHDHGFPIACTATCAEYAYETFRDLGYJEDIFZCAKSCFHGGSDYJODEAYBEHFEEFTDPEHKTGLJNBEKPDIFEDSCFINHPCFJKKNFZKEJLCHCEBDGOJKBKFYEYIOGEAXJPJTASKEDPJKJNHYKEAHCTDAGYCWIHCPDPKGKSJLAAHNHSHFADJZCHIMBYHKSPJZADCF',
      'UR:BYTES/13-10/LPBTBKCFAXIDCYJKCKFWAXHDHGKTIMAMCYJYDEDADRGHCWDMBYHDGMDLAMIOGDHNJEBGKOAYFGHTJOEEFTAAHPDICPADISAOGTKTHFHYCKADFDJEFRJEEEKILBFRCLDSFSENFRETFGIABTAECMFZESHEISEOHEFYDAEHDTCPKGIHESAOHLGUCEETJNBAENIHCXINFMFNNDKBSTCY',
      'UR:BYTES/14-10/LPBABKCFAXIDCYJKCKFWAXHDHGBDCMBZFLGYBSADDNDYAACYJTDYKTCYBBGEBNHGIYCKADCPBBFLIEDTFGCHHHESISKKDNHSBNCKJKFHFTDIKKKGAADPAEESBGFXHKAXDABGKOAMAOKOIMGHKTECEYIEKEDKJOBTBSAYKIBYEYEYIEGTAHAHBEINHSKTKOJNADAYCHFNKTLOZSTK',
      'UR:BYTES/15-10/LPBSBKCFAXIDCYJKCKFWAXHDHGJNDEAECXHTKNEHCTATDAFGEOIOFMGDCMGRFSFXAEHYCAIEJEEHHYECAXCFHYHYFRCABNKBBYDTCWDYDIBWDWCSBZDIIOKKKGHDCEBEBSAAINIHFMDNGSIADTGADIFDJSGOFPFWFECFGHBKKBKKGTEYFHBSGMHNCMDWAOCHCYBGHKFZSETTOLBN',
      'UR:BYTES/16-10/LPBEBKCFAXIDCYJKCKFWAXHDHGFPHTJYAAINIAGYGWKEJEGOAYIYFWHDHNJPHKCWGOGMETBZKTLBECGDBEHTCYHHCPENIDDAFLFLCMGRGOFDETCSIHCWHFFZJKKGAXHKKPDSAXLBIAECGMBTCYIAKKCXBBISGAFRFMHNEOHNHKHEADKEJLKPDIFHGDCSFNHDETCNJLJYRLFLHTJE',
      'UR:BYTES/17-10/LPBYBKCFAXIDCYJKCKFWAXHDHGJKCEBABWJLESBZDMFNAEBTGDCHHGDWBEGOAEKPGHDRHTJKAABDDNCHCYETEHCLASDSBKASDSDRDNCXHDHHDLASASFXBECWDTLBCAASEOJTBTADDYCHBNAYAAFNAXDPCAFNHSHGGDHHDICKDSHDCEJYFNCAFZBBHFHDCWKEHLGSEOFHLRJZKOFP',
      'UR:BYTES/18-10/LPBGBKCFAXIDCYJKCKFWAXHDHGHNCLCSFSJTEHAAFTADAMDIGDEYDICXADBZCKKTCPDMDPDNEOIODWDKFHDPAOEYKGBKEMDLDTBYAYCXHYAECABEASFZJNEHBGDWASHSDKINFHAEAHCWKBBDGDBNAADSGTBYBSCMAOJSBNFRCEIDCEDRCYBSCXDPAXJOIAAHAHBZCYCSLNEETLEY',
      'UR:BYTES/19-10/LPBWBKCFAXIDCYJKCKFWAXHDHGAOCPFGFGBYCMKKLBCWKSHFDIFTCMFZHKCHCMGTDLFEEOADCTATETGWJZJKADHYBWIDEOKTFRBZDYEYFZEHECETHTASBKDKKIHHHYCXHLFZGDAYADDRGDEEAXBWHFAECHHKAEIOCAJTGLGOAAATJZINENBYDMHKJTBZCHDKBSHKFWHFMSYKIARL',
      'UR:BYTES/20-10/LPBBBKCFAXIDCYJKCKFWAXHDHGHKJSKTJNESIEFPJOJSINIHIYJKFEGLIHKSGRGLFEFDGLJLGHGHHFGEJKHDKPKOETIAJYIDFYIDFGJYINEOJKKNHSECDNGUHTJEGLEYFLEOFLKSGHGWGEHTESIYGSGWETHSHGKTIAFEIHGHGYHGIHJLGSIDHGJLIEFLEYGSHSJPGYJLVALEBNIY',
      'UR:BYTES/21-10/LPBZBKCFAXIDCYJKCKFWAXHDHGAMDRAHDKDPJKATDYKTENHSEMEOJNEMKSCLAHEYBGJNBGBTHLENGDASEECTAXAAFNCYESCWCHFZGOFTCWDPFTAEJOLBFZCAFHCAHECWAMAAAHADADHLCHDYINCSDRJSECBSEYJYCEFZFPCKJKAABSADDICPDNJZIEDSDLGAFELBHNDYLSEETLLR',
      'UR:BYTES/22-10/LPCMBKCFAXIDCYJKCKFWAXHDHGGDAOAAAADRHDDMCSCFAAESCAKBHDDAATGECEINJECLHSDSETHLETCNCEATDPHEAYADBWBYENAEBGDPAEECCEADAODEKOFGGLADCPDLBZCTEOHYAYDSCMGODSDEFTKGKIJKCKCNDKDAECCEJSCLATGMCSBYBWCFJEBAKGFEKTINGOGTCHDLYLRK',
      'UR:BYTES/23-10/LPCHBKCFAXIDCYJKCKFWAXHDHGCYFNGTGYASDSHTKBHGJEKEJKKKBGBDDIDEDMGAINHHIYCWDPBDCAIEFPGTJNDACAFXBNCWCWHFGOCSDKGUBNDTENBGFSHPBEIYAECPIODMEHJNBAGRATJLFLKBHDBBGLFHBGAMBBJEKEHEDLCPEYDMBGCLCHFPGEFLCLAMBTKSFDCFDIPSIOLA',
      'UR:BYTES/24-10/LPCSCSBKCFAXIDCYJKCKFWAXHDHGDIDLCPKOBTGOCEBABABAATFMCLKOFRDMFWADEEIOADBKFYCFGLKNCSIAETJKENHSKKAAKOFMCKGUDIBTDKKTGMAAKNBZEOGEGWISEMAOHGHTGLBYJOKIFTHPAEBYJYFRDLKSHKGHBGLBEYCEATGHGACPDAKPIOAMDNIHHNGWGEFTESIMLDFSCP',
      'UR:BYTES/25-10/LPCSCFBKCFAXIDCYJKCKFWAXHDHGKTIYIHIOFDGLGWIAGMGLDYFDGWGUEMIHESJYIYHDEOFEKPDYGHEMJLGAGUECIEKKGUHFDNJZJOJZINFDGAJSKNKOESFLFGGHHSIEIHGEDLDLFWHGGLIDJLIDEMHFKTIEIMIYHGGDGHDLIOIEECDLGYGTJTKODLGSGTEOIOGHGDJYFETILENDWT',
      'UR:BYTES/26-10/LPCSCYBKCFAXIDCYJKCKFWAXHDHGAMBWJTDIHKCPHYFLDYJPIHGHJPJLJPHNGEBDIHKTGWAOBEFTCTGYIAASJYJTCMJKFNDMCFBZCLHTCSBZKEJSIDGOCSKKGEGDJNASEHKKIYEECFDEJEEMGUKNATKBCPGSESATGEFSAHCNIHGWKKCNAMDYETAYEOGOISBGKIIMENCKCAKITKVTDM',
      'UR:BYTES/27-10/LPCSCWBKCFAXIDCYJKCKFWAXHDHGDWESEMEHHHHTCADAFMBKCAGDBYADCLFTAYBTIAADCTBDIYBTASCKEHDADLDLBSASAEDLCHEYAECXCSEMAXBADTAEHGBZBKHDBNEHEEDIFEDWFDBWAMCHJTDWECCNBEFLBDAYGHHPCYAOCNDMECDYAADICXIHBAIOHHBWBTGLFWDPAHHTIMSRTB',
      'UR:BYTES/28-10/LPCSCEBKCFAXIDCYJKCKFWAXHDHGKSFPHDFPGYKPINJOGAFZCFGOEMHLCTFDDMIHCFIYDIKPFGADBDFTIMIMFXAMBZJSJYHNDKGLHTKPKEDICNGSHPKIAHEEBYJEBWIMKTGRCWFSGOKEKKJLHHJZCMGSEHFXDMBYKTLBEMFHFGCAKKAAJKGLFWFZDWCMFLFZGUDYEMFHEYKSPFRFPR',
      'UR:BYTES/29-10/LPCSCABKCFAXIDCYJKCKFWAXHDHGFYENBGEMGMKBFTDLFXEOFWIEFLEOGYBSDYDPCEIEHKKOAEEYHDCXCFCEDWHTCWDTFNAOKIBKFYEYBTDTEHDWBBFPKOGRLBBBDTFPDECTADHYFSCKAODABGEYFYAAHPBAJSAYBZKGCFDRAYAOFYKBJTAMDPJSJNBWJYBYGOCADLFMHEGWAMPSHF',
      'UR:BYTES/30-10/LPCSCKBKCFAXIDCYJKCKFWAXHDHGHKJSKTJNESIEFPJOJSINIHIYJKFEGLIHKSGRGLFEFDGLJLGHGHHFGEJKHDKPKOETIAJYIDFYIDFGJYINEOJKKNHSECDNGUHTJEGLEYFLEOFLKSGHGWGEHTESIYGSGWETHSHGKTIAFEIHGHGYHGIHJLGSIDHGJLIEFLEYGSHSJPGYJLAOKNHHAD',
    ],
  })
  @IsNotEmpty()
  parts: string[]

  @ApiProperty({
    description: 'Network type',
    enum: ENetworks,
    example: ENetworks.ETHEREUM,
  })
  @IsNotEmpty()
  @IsEnum(ENetworks)
  network: ENetworks
}
