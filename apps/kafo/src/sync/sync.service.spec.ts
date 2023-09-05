import { Test } from '@nestjs/testing'

import { SyncService } from './sync.service'
import { UR, UREncoder } from '@ngraveio/bc-ur'
import { BadRequestException } from '@nestjs/common'

describe('SyncService', () => {
  let service: SyncService
  const parts = [
    'UR:BYTES/65-10/LPCSFPBKCFAXDPCYNEUREYPSHDGMIAFMGUFTIEAEGHDMDNISDSHPATHEFHIAAYJPBDAYGUHSHNETDSCACMBNGWHDJYFEDKIOFRGYJKJTDPDNGUHSJYKOHLHFHGBBGLBTDEDSIHENJTCMBYDKEYESCKENGWHDEOKSHKETIYHLAAHNCTIMKIFPFTBGJKBGBZCMVWEMDRMW',
    'UR:BYTES/67-10/LPCSFXBKCFAXDPCYNEUREYPSHDGMESIEETESIEEHHSEHIDEEEYETIDDYIECPDWCPIEHSJYHSCPFTCPFDEEJKGAFPFPFPFPFPFPFPFPDLECHGGMGUHTGDHSGTFWFXFGDLEEKOGDIAECFPJZHSETKOGLJZINGOGAHGKTGOGAGUKKHSJEJOJNKNHTIOGTFPGAIOCKJPESMW',
    'UR:BYTES/70-10/LPCSFGBKCFAXDPCYNEUREYPSHDGMIAIDIEJNKTJZJTKKESGTIADYEYIYGRDNKKGDEHEYJKDLKPINIEENIHEOJPFEJNFDEEGAGLJPIOJSFGFDFWGWFGIYFWJLGAJSINGSISINKTISIMINIOGTGMKTGEISFXKKFGFLJKFPGWFEFEIYKSKKEYINFPFGINJEIOIEGOKNATUE',
    'UR:BYTES/72-10/LPCSFDBKCFAXDPCYNEUREYPSHDGMJOGSFLJSENGOKNGWGUGMJTHSHGGWHDETESHFKOFEGUJYIHJEETFYIAGWKTJTFEKKDLIMIYJPEHGTISJTIHGUJTEYFXENIEIHEEIYDNISEHEMGWGRECFEJYFLDYGAJPKTJKJNEHENECECHDFWINGLJKGLJEJTFXHKHKKNCKSAPKSP',
    'UR:BYTES/74-10/LPCSGEBKCFAXDPCYNEUREYPSHDGMHKAXDRKGCPKOIHJPJKINJLJTCPFTCXEHDWBKCXCXCPKNIHJPJLHEIYINJPJNKTHSJPIHCPFTCPEHDMEYDMEHCPDWCPJYKKJOIHCPFTCPJKKKJTIACPDWCPJNIEECCPFTCPHSDYEOEOETEHEOEHIEEMEYESHSENIYHSEOSSISRPVE',
    'UR:BYTES/76-10/LPCSGSBKCFAXDPCYNEUREYPSHDGMJEFHIYGLBZHSCYGDKECLHDHDCKLBGSCWGWGOJEIYATFYGSLBKKCSIOGMFLLBJSIEKBGDGEHTCYFGCWASIYHNBTHSJZFGIOFNEHBEJZGMCEJYCKJLINAMKKENGSKKFDJEISFECKKTIOKOFPAYKOBWJNAXEMCMCFIMEYEERTPFKPDR',
    'UR:BYTES/78-10/LPCSGLBKCFAXDPCYNEUREYPSHDGMBDCNGLHPHSHGEOGODPHPJTBNINJEHLDMBDISKOHPFPKTDEFDKGLBJTDNFYIAKIFEBYIAKPFTJOHEIODMCXENISBNESFGKIDYCAKOCSFYCTAEIYJOJTCKAMDWBBIDCEBWKKEYKSHKBGEEFRHEGRESFNLBAEGDFWJYJNDMKOKTGADW',
    'UR:BYTES/81-10/LPCSGYBKCFAXDPCYNEUREYPSHDGMDEBBDABSHFBNJEBWFRJZCYEHKPDWAHHTFTDPFHBSIMBAAMETCEHGDWBWAHBYCPBTFTBZDSBWJNCLDLHDEHHGGEBGDLKBDSKIKSFWAACMHTCMKGHLHLDPHFFWKGAEJOBSHEDRDEAMGUBEBDJPDILBBBGRFYIEHPGMKOJTTTTNDAGL',
    'UR:BYTES/83-10/LPCSGUBKCFAXDPCYNEUREYPSHDGMIYIYJZHTGOGAHDJSFWFLEOFPGYEHKOGLJEJLEOETHDJSFPJOENJEKSHSFDDLJKGSDNISINHKISJODLJYKNHSFLFXFPHDHDJTGOGWJYIAKNESJSKTECEMFXIDGWHTDNHSGLKPJYGHJNIMGRGLJPGUIMEEHSFGETKTGSECRPUYJTPL',
    'UR:BYTES/85-10/LPCSGOBKCFAXDPCYNEUREYPSHDGMGMGDIDBGFXBBCXEHCHENJTDWHYDNKGHKFDHYISHSKBKBBTEMHTDTBYDRDWHTBSBKGTDYJKBZCKHYBDKIIOAYBYAMCLCFBKBTENAMCFHLBGFRFHGHDAKTFRCMHGDTJKBKJZISAEFEDABBAAJSFRFGFXBWDMDIFNIEBZKSPKIEFWLU',
  ]
  const originalData =
    'H4sIAAAAAAAA/5WRSZPaMBCF/4vPc5Ala8vNliUIWwUISyakpmzZgMAIg8cGk5r/HkFlmWPm9rq71O/1J+/nytNHY6uV9+m709HnL0HgNHhaeZekKPLXP5NE62Nt/5VZds6re7XyUu2f1ghta9vYArfFlQf1dndud7Su9IUWVUnIgdt9Xa48t3drsiy37uU6KarcNYzN8utv07JOC6P3efvYDJAPlC+CACmqCGMBikSIAuxTimJJGeOKABnSiDElIwg4QW7GsC8AAIRhDFbe24+/t7y8d7o6q4fJzQlyHsrB8DZpLGq6UzOSRnaWOX89VvEStek8DcOwnEy/jfr1MhneSn2C6de4f+h17OK5EtG0Irwsm1655XBiNsNknCYYzcbdmwlny9Mc02fK+yP12s/uid6e3rEmH4INrgqFHBOFfBoIqiLhiwhjigMRwJhCyFGsAOEEfxy2iAFikgdcEimVqyhkOMY0AjELgRtCICGimMowhNDxpgJziJiiUigKov+AfRdEXM+XqW8ltPOI9xpit6exTvunRS+bXfflZUIXqBG3AQ1vNko38XqAp6kxaH/sL+hiYhp/tzaGCAXXnUOtcz9qw57CbOZ+aNutTmjKNrSj4aF8wL5nKhK7qZNN/gghRw82VWv1i8keLchgAjNOGIdYw0T7AWbUZxnCAKcog26R9wtn5mPWLQMAAA=='

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [SyncService],
    }).compile()

    service = app.get<SyncService>(SyncService)
  })

  it('should return "Welcome to bristle!"', () => {
    expect(service.welcomeMessage).toEqual(SyncService.welcomeMessage)
  })

  // it('should verify the payload', async () => {
  //   const message = { message1: 'property1' }
  //   const messageBuffer = Buffer.from(JSON.stringify(message))

  //   const ur = UR.fromBuffer(messageBuffer)
  //   const maxFragmentLength = 150
  //   const firstSeqNum = 0

  //   const encoder = new UREncoder(ur, maxFragmentLength, firstSeqNum)

  //   const part = encoder.nextPart()

  //   expect(await service.verifyPayload([part])).toBe(JSON.stringify(message))
  // })

  it('should verify the liquid parts', async () => {
    const coins = await service.verifyPayload(parts)
    expect(coins.length).toBe(2)
  })

  it('should throw error when missing part', async () => {
    try {
      await service.verifyPayload(parts.slice(0, parts.length - 1))
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
    }
  })
})
