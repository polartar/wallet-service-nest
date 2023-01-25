import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccountEntity])]
})
export class AccountModule {

    
}
