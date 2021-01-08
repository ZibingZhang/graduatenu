# == Schema Information
#
# Table name: plan_changelogs
#
#  id         :bigint(8)        not null, primary key
#  log        :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  author_id  :bigint(8)        not null
#  plan_id    :bigint(8)
#
# Indexes
#
#  index_plan_changelogs_on_plan_id  (plan_id)
#
FactoryBot.define do
  factory :plan_changelog do
    
  end
end
