# == Schema Information
#
# Table name: plans
#
#  id                   :bigint(8)        not null, primary key
#  course_counter       :integer(4)
#  course_warnings      :json             default([]), is an Array
#  link_sharing_enabled :boolean
#  major                :string
#  name                 :string
#  planString           :string
#  schedule             :json
#  warnings             :json             default([]), is an Array
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  user_id              :bigint(8)        not null
#
# Indexes
#
#  index_plans_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Plan < ApplicationRecord
  belongs_to :user
end
