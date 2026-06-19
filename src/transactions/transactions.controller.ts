import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get()
    @ApiOperation({ summary: 'List transactions' })
    @ApiOkResponse({ description: 'Returns transactions list.' })
    findAll(@Query() query: FindTransactionsQueryDto) {
        return this.transactionsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get transaction by id' })
    @ApiOkResponse({ description: 'Returns selected transaction.' })
    @ApiNotFoundResponse({ description: 'Transaction not found.' })
    findOne(@Param('id') id: string) {
        return this.transactionsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create transaction' })
    @ApiCreatedResponse({ description: 'Transaction created successfully.' })
    @ApiBadRequestResponse({
        description: 'Order does not belong to player or amount exceeds remaining amount.',
    })
    @ApiNotFoundResponse({ description: 'Player or order not found.' })
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionsService.create(createTransactionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete transaction' })
    @ApiOkResponse({ description: 'Transaction deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Transaction not found.' })
    remove(@Param('id') id: string) {
        return this.transactionsService.remove(id);
    }
}
