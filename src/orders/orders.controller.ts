import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    @ApiOperation({ summary: 'List orders' })
    @ApiOkResponse({ description: 'Returns orders list.' })
    findAll(@Query() query: FindOrdersQueryDto) {
        return this.ordersService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by id' })
    @ApiOkResponse({ description: 'Returns selected order.' })
    @ApiNotFoundResponse({ description: 'Order not found.' })
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create order' })
    @ApiCreatedResponse({ description: 'Order created successfully.' })
    @ApiNotFoundResponse({ description: 'Player not found.' })
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update order' })
    @ApiOkResponse({ description: 'Order updated successfully.' })
    @ApiNotFoundResponse({ description: 'Order or player not found.' })
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete order' })
    @ApiOkResponse({ description: 'Order deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Order not found.' })
    remove(@Param('id') id: string) {
        return this.ordersService.remove(id);
    }
}
