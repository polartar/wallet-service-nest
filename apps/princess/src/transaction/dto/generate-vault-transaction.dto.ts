import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class GenerateVaultTransactionDto {
  @ApiProperty({
    description: 'serialized transaction body',
    default:
      '{\n  "type": 2,\n  "from": "0x3D1683a3Ff587F89388eAFC8381A7A0feE593ffe",\n  "to": "0x371398af172609f57f0F13Be4c1AAf48AcCEB59d",\n  "value": {\n      "value": "0.000001",\n      "factor": 0\n  },\n  "extra": {\n      "transferMessage": "remember",\n      "publicKey": "0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc",\n      "encodedDataMessage": "0x72656d656d626572"\n  },\n  "fee": {\n      "fee": {\n          "value": "0.0006637993703654",\n          "factor": 0\n      },\n      "extra": {\n          "gas": 21128,\n          "gasPrice": "31417993675"\n      }\n  },\n  "nativeTransaction": {\n      "nonce": "0x5",\n      "gasPrice": "0x750a889cb",\n      "gasLimit": "0x5288",\n      "to": "0x371398af172609f57f0f13be4c1aaf48acceb59d",\n      "value": "0xe8d4a51000",\n      "data": "0x72656d656d626572",\n      "chainId": 1\n  },\n  "signingPayloads": [\n      {\n          "address": "0x3D1683a3Ff587F89388eAFC8381A7A0feE593ffe",\n          "publickey": "0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc",\n          "tosign": "ba5da01af13f777a40eca8c36346c751af79935d601c8e0b7d815554de1b09d1"\n      }\n  ]\n}',
  })
  @IsNotEmpty()
  serializedTransaction: string

  @ApiProperty({
    description: 'derived index',
    default: '0',
  })
  @IsNotEmpty()
  derivationIndex: number
}
