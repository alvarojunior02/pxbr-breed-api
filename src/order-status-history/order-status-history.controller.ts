import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { CreateOrderStatusHistoryDto } from './dto/create-order-status-history.dto';
import { OrderStatusHistoryService } from './order-status-history.service';

@ApiTags('Order Status History')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller()
export class OrderStatusHistoryController {
    constructor(private readonly orderStatusHistoryService: OrderStatusHistoryService) {}

    @Get('orders/:orderId/status-history')
    @ApiOperation({ summary: 'List order status history' })
    @ApiOkResponse({
        description: 'Returns status history from selected order.',
    })
    @ApiNotFoundResponse({ description: 'Order not found.' })
    findByOrder(@Param('orderId') orderId: string) {
        return this.orderStatusHistoryService.findByOrder(orderId);
    }

    @Post('orders/:orderId/status-history')
    @ApiOperation({ summary: 'Create order status history record' })
    @ApiCreatedResponse({ description: 'Status history created successfully.' })
    @ApiNotFoundResponse({ description: 'Order not found.' })
    create(
        @Param('orderId') orderId: string,
        @Body() createOrderStatusHistoryDto: CreateOrderStatusHistoryDto,
    ) {
        return this.orderStatusHistoryService.create(orderId, createOrderStatusHistoryDto);
    }

    @Delete('order-status-history/:id')
    @ApiOperation({ summary: 'Delete order status history record' })
    @ApiOkResponse({ description: 'Status history deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Order status history not found.' })
    remove(@Param('id') id: string) {
        return this.orderStatusHistoryService.remove(id);
    }
}
