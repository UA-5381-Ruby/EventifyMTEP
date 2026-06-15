# frozen_string_literal: true

class TicketPdfService
  PAGE_SIZE     = 'A5'
  MARGIN        = 30
  PRIMARY_COLOR = '2563EB'
  TEXT_COLOR    = '1F2937'
  MUTED_COLOR   = '6B7280'

  def self.generate(ticket)
    new(ticket).generate
  end

  def initialize(ticket)
    @ticket = ticket
    @event  = ticket.event
    @user   = ticket.user
  end

  def generate
    Prawn::Document.new(page_size: PAGE_SIZE, margin: MARGIN) do |pdf|
      render_header(pdf)
      render_divider(pdf)
      render_event_info(pdf)
      render_divider(pdf)
      render_qr_code(pdf)
      render_footer(pdf)
    end.render
  end

  private

  def render_header(pdf)
    pdf.fill_color PRIMARY_COLOR
    pdf.text 'TICKET', size: 28, style: :bold, align: :center
    pdf.fill_color TEXT_COLOR
    pdf.move_down 6
    pdf.text @event.title, size: 18, style: :bold, align: :center
  end

  def render_divider(pdf)
    pdf.move_down 10
    pdf.stroke_color 'E5E7EB'
    pdf.stroke_horizontal_rule
    pdf.move_down 10
  end

  def render_event_info(pdf)
    pdf.fill_color MUTED_COLOR
    pdf.text 'Date & Time', size: 9, style: :bold
    pdf.fill_color TEXT_COLOR
    pdf.text formatted_date, size: 11
    pdf.move_down 8

    pdf.fill_color MUTED_COLOR
    pdf.text 'Location', size: 9, style: :bold
    pdf.fill_color TEXT_COLOR
    pdf.text @event.location.to_s, size: 11
    pdf.move_down 8

    pdf.fill_color MUTED_COLOR
    pdf.text 'Attendee', size: 9, style: :bold
    pdf.fill_color TEXT_COLOR
    pdf.text @user.name.to_s, size: 11
    pdf.move_down 8

    pdf.fill_color MUTED_COLOR
    pdf.text 'Ticket ID', size: 9, style: :bold
    pdf.fill_color TEXT_COLOR
    pdf.text @ticket.qr_code, size: 9
  end

  def render_qr_code(pdf)
    pdf.move_down 4
    pdf.print_qr_code(@ticket.qr_code, extent: 120, pos: [pdf.bounds.width / 2 - 60, pdf.cursor])
    pdf.move_down 130
    pdf.fill_color MUTED_COLOR
    pdf.text 'Scan to verify your ticket', size: 8, align: :center
  end

  def render_footer(pdf)
    pdf.move_down 16
    pdf.fill_color MUTED_COLOR
    pdf.text 'This ticket is non-transferable. Present this QR code at the entrance.',
             size: 8, align: :center
  end

  def formatted_date
    start_date = @event.start_date&.strftime('%A, %B %-d, %Y • %H:%M')
    end_date   = @event.end_date&.strftime('%H:%M')
    end_date   ? "#{start_date} – #{end_date}" : start_date.to_s
  end
end