import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

export class GenerateTransactionDto {
  @ApiProperty({
    description: 'from address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  from: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description:
      'amount that will be involved in the transaction, this will be ETH/BTC',
    default: '0.0001',
  })
  @IsNotEmpty()
  amount: string

  @ApiProperty({
    description: 'network type',
    enum: ENetworks,
    default: ENetworks.ETHEREUM_TEST,
  })
  @IsEnum(ENetworks)
  network: ENetworks

  @ApiProperty({
    description: 'transfer message',
    default: 'merhaba',
  })
  @IsOptional()
  transferMessage: string

  @ApiProperty({
    description: 'Public key',
    default:
      '0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc',
  })
  @IsNotEmpty()
  publicKey: string
}

export class GenerateTransactionSwaggerResponse {
  @ApiProperty({
    example: {
      type: 'transaction',
    },
  })
  meta: object

  @ApiProperty({
    example: {
      // eslint-disable-next-line no-useless-escape
      signingPayloads: `"[{\"address\":\"0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03\",\"publickey\":\"0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc\",\"tosign\":\"df098f069542d5c6973d55d8e1c247158d1f2bdd0284cb8755b3c275886bba0d\"}]"`,
      // eslint-disable-next-line no-useless-escape
      serializedTransaction: `{\"type\":2,\"from\":\"0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03\",\"to\":\"0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03\",\"value\":{\"value\":\"0.0001\",\"factor\":0},\"extra\":{\"transferMessage\":\"merhaba\",\"publicKey\":\"0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc\",\"encodedDataMessage\":\"0x6d657268616261\"},\"fee\":{\"fee\":{\"value\":\"0.000039196713458448\",\"factor\":0},\"extra\":{\"gas\":21112,\"gasPrice\":\"1856608254\"}},\"nativeTransaction\":{\"nonce\":\"0x26f\",\"gasPrice\":\"0x6ea997fe\",\"gasLimit\":\"0x5278\",\"to\":\"0xe456f9a32e5f11035ffbea0e97d1aafda6e60f03\",\"value\":\"0x5af3107a4000\",\"data\":\"0x6d657268616261\",\"chainId\":5},\"signingPayloads\":[{\"address\":\"0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03\",\"publickey\":\"0295deb418112ccbf9ff1d5c81cbdbd74503016d143f087ad2858facde962bebbc\",\"tosign\":\"df098f069542d5c6973d55d8e1c247158d1f2bdd0284cb8755b3c275886bba0d\"}]}`,
      serverSignature:
        'NgsBb4xDEQpWkO3z74WayA46cDTnMVSTXr8Q8nIsdV8tNmA48RKLAOEo5RqP7FKrj1qOgelFWqvPABCcgR4ess00+DYoBJyMhBP0Ps8GyLKFsL6SVHkCcdPfW+hTadrClLD1ZNojjmbV4jzmJOwZs969Ft9BQOOG51u4byr9E4A=',
    },
  })
  data: object
}

export class PublishTransactionSwaggerResponse {
  @ApiProperty({
    example: {
      type: 'string',
    },
  })
  meta: object

  @ApiProperty({
    example: {
      txhash: 'string',
    },
  })
  data: object
}
