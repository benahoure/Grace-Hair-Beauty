locals {
  public_api_zip = "${path.module}/../lambdas/dist/public-api.zip"
  admin_api_zip  = "${path.module}/../lambdas/dist/admin-api.zip"

  public_lambda_name = "gracehairsbeauty-${var.env}-public-api"
  admin_lambda_name  = "gracehairsbeauty-${var.env}-admin-api"

  dynamodb_table_arns = [
    aws_dynamodb_table.services.arn,
    aws_dynamodb_table.appointments.arn,
    aws_dynamodb_table.portfolio.arn,
    aws_dynamodb_table.reviews.arn,
    aws_dynamodb_table.contact_messages.arn,
    aws_dynamodb_table.business_settings.arn,
    aws_dynamodb_table.admin_audit_log.arn,
    aws_dynamodb_table.idempotency.arn,
  ]

  dynamodb_index_arns = [
    "${aws_dynamodb_table.services.arn}/index/*",
    "${aws_dynamodb_table.appointments.arn}/index/*",
    "${aws_dynamodb_table.portfolio.arn}/index/*",
    "${aws_dynamodb_table.reviews.arn}/index/*",
    "${aws_dynamodb_table.contact_messages.arn}/index/*",
    "${aws_dynamodb_table.business_settings.arn}/index/*",
    "${aws_dynamodb_table.admin_audit_log.arn}/index/*",
    "${aws_dynamodb_table.idempotency.arn}/index/*",
  ]

  public_read_table_arns = [
    aws_dynamodb_table.services.arn,
    "${aws_dynamodb_table.services.arn}/index/*",
    aws_dynamodb_table.portfolio.arn,
    "${aws_dynamodb_table.portfolio.arn}/index/*",
    aws_dynamodb_table.reviews.arn,
    "${aws_dynamodb_table.reviews.arn}/index/*",
    aws_dynamodb_table.business_settings.arn,
  ]

  public_routes = toset([
    "GET /services",
    "GET /services/{serviceId}",
    "GET /portfolio",
    "GET /reviews",
    "GET /business-settings",
    "POST /appointments",
    "POST /contact",
    "POST /reviews",
  ])

  admin_routes = toset([
    "GET /admin/services",
    "POST /admin/services",
    "PATCH /admin/services/{serviceId}",
    "DELETE /admin/services/{serviceId}",
    "GET /admin/portfolio",
    "POST /admin/portfolio",
    "PATCH /admin/portfolio/{styleId}",
    "DELETE /admin/portfolio/{styleId}",
    "GET /admin/reviews",
    "POST /admin/reviews",
    "PATCH /admin/reviews/{reviewId}",
    "DELETE /admin/reviews/{reviewId}",
    "GET /admin/appointments",
    "PATCH /admin/appointments/{appointmentId}",
    "GET /admin/contact-messages",
    "GET /admin/business-settings",
    "PATCH /admin/business-settings",
    "GET /admin/audit-log",
  ])
}
