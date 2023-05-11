/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppService } from '../src/app/app.service'

import axios from 'axios'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../src/environments/environment.dev'
import { AppModule } from '../src/app/app.module'
import { VaultModule } from '../src/vault/vault.module'

import { Environment as BristleEnvironment } from '../../bristle/src/environments/environment.dev'
import { AppModule as BristleAppModule } from '../../bristle/src/app/app.module'
import { AppService as BristleAppService } from '../../bristle/src/app/app.service'

describe('Princess Vault System Test', () => {
  let app: INestApplication

  // Bristle server
  async function runBristleServer() {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [BristleEnvironment] }),
        BristleAppModule,
      ],
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.listen(3332)
  }

  // Princess server
  async function runMainServer() {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }),
        AppModule,
        // VaultModule,
        HttpModule, //
      ],
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.listen(3000)
  }

  beforeAll(async () => {
    // Initialize and start the server
    // jest.useFakeTimers()
    await runMainServer()
    await runBristleServer()
  }, 20000)

  describe('Service health check', () => {
    it('Welcome message in Princess', async () => {
      const data = await axios.get('http://localhost:3000/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(AppService.welcomeMessage)
    })

    it('Welcome message in Bristle', async () => {
      const data = await axios.get('http://localhost:3332/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(BristleAppService.welcomeMessage)
    })
  })

  describe('Vault Sync', () => {
    it('should create the addresses from the parts', async () => {
      const response = await axios.post('http://localhost:3000/vault/sync', {
        parts: [
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
        ],
      })
      const wallets = response.data
      console.log({ response })
      expect(response.status).toEqual(201)
      expect(wallets.length).toEqual(2)
      expect(wallets[0].xPub).toEqual(
        'xpub6CC2ecHtJKaNm29cbw1Hfa7qpdFt1QiiwxCu8ThgRNANkAaZNUdEL9xiQMX9D6cLWxe24SAxnqoxXERV4dxTVxM6naPyVBRsKGZAs5aBUC9',
      )
      expect(wallets[0].addresses[0].address).toEqual(
        '0xf7609B4797e3A8a7046C4C8ba7d7187b202ad58a',
      )
      // expect(wallets[1].xPub).toEqual(
      //   'xpub6Cogi4wR8arxzcrfoia821AAH6Ds3qH9LaMBpvaUBLYKNQK1UbBghYXjttSCdc9RLDtmavGcx5KVnChYb1GNwHhX1vRVncNAQwKiPWeqffU',
      // )
    })
  })
})
