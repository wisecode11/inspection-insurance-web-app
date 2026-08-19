import { endpoints } from "@/lib/api/endpoints"
import { apiGet } from "@/lib/api/request"
import { listTicketsMock } from "@/modules/platform-support/mocks/support.mock"

export const supportService = {
  listTickets: () => apiGet(endpoints.support.tickets, listTicketsMock),
}
